import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import pdf from 'pdf-parse';
import { ParsedDocument, ParsedPage } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PDF 파일 업로드 및 페이지별 텍스트 추출 API
 *
 * [핵심 기능]
 * 1. 클라이언트에서 전달받은 multipart/form-data PDF 파일 수신
 * 2. pdf-parse의 pagerender 옵션을 활용하여 페이지 번호 메타데이터 보존
 * 3. 스캔 이미지(OCR 미처리) 또는 암호화된 PDF에 대한 친절한 예외 처리
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '업로드할 PDF 파일이 선택되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 형식 검증
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'PDF 형식(.pdf)의 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (최대 35MB)
    const MAX_FILE_SIZE = 35 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 최대 35MB까지 지원됩니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 페이지별 텍스트를 담을 배열
    const extractedPages: ParsedPage[] = [];

    // pdf-parse 커스텀 페이지 렌더러
    const renderPage = async (pageData: any) => {
      try {
        const textContent = await pageData.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false,
        });

        let lastY: number | null = null;
        let pageStr = '';

        for (const item of textContent.items) {
          if (lastY === item.transform[5] || lastY === null) {
            pageStr += item.str + ' ';
          } else {
            pageStr += '\n' + item.str + ' ';
          }
          lastY = item.transform[5];
        }

        const cleanedText = pageStr
          .replace(/[ \t]+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();

        const pageNumber = pageData.pageIndex + 1;
        extractedPages.push({
          pageNumber,
          text: cleanedText,
        });

        return `\n--- [Page ${pageNumber}] ---\n${cleanedText}\n`;
      } catch (err) {
        console.error('페이지 파싱 중 오류 발생:', err);
        return '';
      }
    };

    const pdfOptions = {
      pagerender: renderPage,
    };

    let pdfResult;
    try {
      pdfResult = await pdf(buffer, pdfOptions);
    } catch (parseError: any) {
      const errMsg = parseError?.message || '';
      if (errMsg.includes('password') || errMsg.includes('encrypted')) {
        return NextResponse.json(
          {
            success: false,
            error: '암호로 보호된 PDF 문서입니다. 암호를 해제한 후 다시 업로드해 주세요.',
          },
          { status: 422 }
        );
      }
      throw parseError;
    }

    // 페이지 순서 정렬 (비동기 콜백 순서 보장)
    extractedPages.sort((a, b) => a.pageNumber - b.pageNumber);

    // 전체 텍스트 추출 확인 (스캔본 검출)
    const totalChars = extractedPages.reduce((acc, p) => acc + p.text.length, 0);

    if (totalChars < 30) {
      return NextResponse.json(
        {
          success: false,
          error:
            '해당 PDF에서 텍스트를 추출할 수 없습니다. 글자가 이미지로만 이루어진 스캔본 PDF이거나 빈 문서일 수 있습니다. OCR(텍스트 인식) 처리가 완료된 PDF를 업로드해 주세요.',
        },
        { status: 422 }
      );
    }

    // AI에게 제공할 페이지 구분자가 포함된 전체 텍스트 조합
    const formattedFullText = extractedPages
      .map((p) => `--- [Page ${p.pageNumber}] ---\n${p.text}`)
      .join('\n\n');

    const parsedDocument: ParsedDocument = {
      metadata: {
        fileName: file.name,
        totalPages: pdfResult.numpages || extractedPages.length,
        characterCount: totalChars,
        uploadedAt: new Date().toISOString(),
      },
      pages: extractedPages,
      fullText: formattedFullText,
    };

    return NextResponse.json({
      success: true,
      document: parsedDocument,
    });
  } catch (error: any) {
    console.error('PDF 업로드 및 파싱 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'PDF 문서를 파싱하는 도중 알 수 없는 오류가 발생했습니다. 파일이 손상되지 않았는지 확인해 주세요.',
      },
      { status: 500 }
    );
  }
}
