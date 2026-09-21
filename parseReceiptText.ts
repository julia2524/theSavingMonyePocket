export interface ParsedReceipt {
  storeName: string | null;
  totalAmount: number | null;
  possibleDate: string | null;
  possibleAmounts: number[];
}

export function parseReceiptText(rawText: string): ParsedReceipt {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // 1. 🏪 범용 문맥 기반 상호명 추출
  const storeName = extractStoreNameGenerically(lines);

  // 1. 📅 날짜 추출 (OCR 깨짐 보정 및 다중 패턴 대응)
  const possibleDate = extractDateRobustly(rawText);

  // 2. 제외할 키워드 (포인트, 승인번호, 전화번호 등)
  const excludeKeywords = [
    "포인트",
    "POINT",
    "잔여",
    "적립초", // "적립초과/한도" 등
    "TEL",
    "사업자",
    "NO",
    "S9",
  ];

  // 3. 우대 채택 키워드 (매출금액, 합계, 결제금액)
  const targetKeywords = [
    "매출",
    "결제",
    "합계",
    "TOTAL",
    "AMOUNT",
    "승인금액",
    "승인",
  ];

  // 3. 우대 채택 키워드 (매출금액, 합계, 결제금액) - 정규식으로 변경
  const targetRegex = /(매출|결제|합계|TOTAL|AMOUNT|승인|승의)/i;

  let bestAmount: number | null = null;
  const candidateAmounts: number[] = [];

  lines.forEach((line) => {
    const upper = line.toUpperCase();

    if (excludeKeywords.some((key) => upper.includes(key))) {
      return;
    }

    const sanitizedLine = line.replace(/B(?=\d)/g, "8");
    const num = extractNumber(sanitizedLine);

    if (num && num >= 100 && num <= 5000000) {
      candidateAmounts.push(num);

      // 기존: targetKeywords.some((key) => upper.includes(key))
      // 변경: targetRegex.test(line) 로 교체
      if (targetRegex.test(line) && !bestAmount) {
        bestAmount = num;
      }
    }
  });
  // lines.forEach((line) => {
  //   const upper = line.toUpperCase();

  //   // 포인트나 전화번호 라인은 완전 제외
  //   if (excludeKeywords.some((key) => upper.includes(key))) {
  //     return;
  //   }

  //   // B560 같은 OCR 깨짐 현상 보정 (B -> 8)
  //   const sanitizedLine = line.replace(/B(?=\d)/g, "8");
  //   const num = extractNumber(sanitizedLine);

  //   if (num && num >= 100 && num <= 5000000) {
  //     candidateAmounts.push(num);

  //     // '매출' 또는 '합계' 관련 줄에 위치한 숫자 우선 선택
  //     if (targetKeywords.some((key) => upper.includes(key)) && !bestAmount) {
  //       bestAmount = num;
  //     }
  //   }
  // });

  // Target 키워드로 못 찾았으면 후보 중 상위 영역/최다 빈도값 채택
  if (!bestAmount && candidateAmounts.length > 0) {
    // 보통 8,560처럼 반복해서 가장 자주 나온 금액 채택
    bestAmount = getMostFrequentNumber(candidateAmounts);
  }

  return {
    storeName,
    totalAmount: bestAmount,
    possibleDate,
    possibleAmounts: Array.from(new Set(candidateAmounts)), // 👈 키 이름 수정
  };
}
// --------------------------------------------------------------
// 상호명 추출
// --------------------------------------------------------------

/**
 * 실무에서 자주 등장하는 체인점(편의점/마트/카페 등) 패턴.
 * 필요에 따라 계속 추가하거나, 나중에 JSON/DB로 분리해서
 * 배포 없이 갱신할 수 있게 만드는 걸 추천합니다.
 */
const KNOWN_BRAND_PATTERNS: RegExp[] = [
  /GS\s?25/i,
  /\bCU\b/,
  /세븐일레븐/,
  /이마트\s?(24)?/,
  /홈플러스/,
  /롯데마트/,
  /농협\s?하나로마트/,
  /스타벅스/,
  /이디야/,
  /투썸플레이스/,
  /메가커피/,
  /컴포즈커피/,
  /페이히어/,
  /미니스톱/,
];

function cleanLine(raw: string): string {
  return raw
    .replace(/[|*_=[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 알려진 체인점 브랜드명이 상단에 보이면 우선적으로 사용.
 * 휴리스틱 점수 계산보다 훨씬 신뢰도가 높습니다.
 */
function findKnownBrandLine(lines: string[]): string | null {
  const limit = Math.min(lines.length, 10);
  for (let i = 0; i < limit; i++) {
    const text = cleanLine(lines[i]);
    for (const pattern of KNOWN_BRAND_PATTERNS) {
      if (pattern.test(text)) {
        return text;
      }
    }
  }
  return null;
}

/**
 * 하드코딩 없이(브랜드 사전 매칭 실패 시) 영수증 서식 특성을
 * 이용해 상호명을 추출하는 범용 함수
 */
function extractStoreNameGenerically(lines: string[]): string | null {
  // 0. 알려진 브랜드가 있으면 바로 사용
  const brandMatch = findKnownBrandLine(lines);
  if (brandMatch) return brandMatch;

  // 영수증에서 상호명이 아닐 가능성이 높은 "구조적" 패턴만 정의
  const metaRegex =
    /영수증|receipt|거래\s*일시|승인\s*일시|사업자|대표|주소|전화|tel|홈페이지|http|www|매출|승인번호|주문번호|가맹점|카드|할부|포인트|적립|상품명|상품\s*내역|결제\s*내역/i;

  const businessNumberRegex = /\d{3}[-.\s]?\d{2}[-.\s]?\d{5}/;
  const phoneRegex = /(?:\d{2,3}[-.\s]?)?\d{3,4}[-.\s]\d{4}/;
  const dateRegex =
    /(?:19|20)\d{2}[-./년\s]?(?:0?[1-9]|1[0-2])[-./월\s]?(?:0?[1-9]|[12]\d|3[01])/;

  // 상호명은 보통 명사(구)이고, 슬로건·안내문은 서술어로 끝나는 "문장"입니다.
  // OCR이 슬로건 뒤에 영문/숫자 파편을 잘못 붙이는 경우
  // (예: "...행복을 만나다 GS2")도 커버하기 위해
  // 종결어미 뒤에 짧은 영숫자 꼬리가 붙는 것까지 허용합니다.
  const sentenceEndingRegex =
    /(?:다|요|며|니다|세요|합니다|드립니다|바랍니다)\s*[A-Za-z0-9]{0,4}$/;

  const candidates: { text: string; score: number }[] = [];

  // 상호명은 일반적으로 영수증 상단에 존재하므로
  // 너무 아래까지 내려가지 않고 앞부분을 탐색한다.
  const searchLimit = Math.min(lines.length, 10);

  for (let i = 0; i < searchLimit; i++) {
    const text = cleanLine(lines[i]);

    if (!text || text.length < 2) continue;

    // --------------------------------
    // 명백하게 상호명이 아닌 경우
    // --------------------------------

    if (metaRegex.test(text)) continue;
    if (businessNumberRegex.test(text)) continue;
    if (phoneRegex.test(text)) continue;
    if (dateRegex.test(text)) continue;
    if (sentenceEndingRegex.test(text)) continue; // 슬로건/안내문 제외

    // URL
    if (/https?:\/\//i.test(text) || /www\./i.test(text)) continue;

    // 숫자/기호만 있는 줄
    if (!/[가-힣A-Za-z]/.test(text)) continue;

    let score = 0;

    // --------------------------------
    // 위치
    // --------------------------------

    // 상단일수록 상호명일 가능성이 높음
    score += Math.max(0, 5 - i);

    // --------------------------------
    // 문자 형태
    // --------------------------------

    // 한글 또는 영문이 포함된 텍스트
    if (/[가-힣]/.test(text)) {
      score += 4;
    }

    if (/[A-Za-z]/.test(text)) {
      score += 2;
    }

    // 숫자가 없는 깔끔한 텍스트
    if (!/\d/.test(text)) {
      score += 2;
    }

    // --------------------------------
    // 상품/품목처럼 보이는 구조 감점
    // --------------------------------

    // "001 상품명", "02 상품명" 같은 품목 번호
    if (/^\d{1,3}\s*[.)]?\s*[A-Za-z가-힣]/.test(text)) {
      score -= 4;
    }

    // 바코드/상품코드가 섞인 긴 숫자
    if (/\d{6,}/.test(text)) {
      score -= 4;
    }

    // 수량/단위처럼 보이는 경우
    if (/\b(?:kg|g|ml|l|cm|mm|개|입|병|팩|봉|EA)\b/i.test(text)) {
      score -= 3;
    }

    // --------------------------------
    // 주소 형태 감점
    // --------------------------------

    // 도로명/주소처럼 보이는 구조
    if (
      /(?:특별시|광역시|도|시|군|구)\s/.test(text) &&
      /(?:로|길|대로)/.test(text)
    ) {
      score -= 5;
    }

    // 층/번지 등이 포함된 주소
    if (/(?:\d+\s*번지|\d+\s*층)/.test(text)) {
      score -= 4;
    }

    // --------------------------------
    // 너무 긴 문장은 상호명 가능성 낮음
    // --------------------------------

    if (text.length > 30) {
      score -= 2;
    }

    if (text.length > 45) {
      score -= 4;
    }

    // --------------------------------
    // 최종 후보
    // --------------------------------

    if (score > 0) {
      candidates.push({
        text,
        score,
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // 가장 높은 점수의 후보
  candidates.sort((a, b) => b.score - a.score);

  return candidates[0].text;
}

function extractNumber(text: string): number | null {
  // 8.560, 8,560, 그리고 OCR에서 흔한 "8, 560" (쉼표 뒤 공백)까지 커버
  const match = text.match(/([1-9]\d{0,2}[.,]\s?\d{3})/);
  if (match) {
    return parseInt(match[1].replace(/[.,\s]/g, ""), 10);
  }
  return null;
}

function getMostFrequentNumber(arr: number[]): number {
  const counts: { [key: number]: number } = {};
  arr.forEach((num) => (counts[num] = (counts[num] || 0) + 1));
  return parseInt(
    Object.keys(counts).reduce((a, b) =>
      counts[parseInt(a)] > counts[parseInt(b)] ? a : b,
    ),
    10,
  );
}
function extractDateRobustly(rawText: string): string | null {
  // 1. OCR 흔한 오탈자 보정 (2821 -> 2021, 2B21 -> 2021)
  const sanitizedText = rawText
    .replace(/2[8B]2(\d)/g, "202$1") // 2821, 2B21 -> 2021
    .replace(/202I/g, "2021"); // I -> 1 보정

  // Pattern 1: YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
  const yyyyRegex =
    /(20[1-2]\d)[-./]?(0[1-9]|1[0-2])[-./]?(0[1-9]|[12]\d|3[01])/;
  const yyyyMatch = sanitizedText.match(yyyyRegex);

  if (yyyyMatch) {
    return `${yyyyMatch[1]}.${yyyyMatch[2]}.${yyyyMatch[3]}`;
  }

  // Pattern 2: YY/MM/DD, YY-MM-DD (예: --21/10/31)
  const yyRegex =
    /(?:^|[^\d])([1-2]\d)[-./](0[1-9]|1[0-2])[-./](0[1-9]|[12]\d|3[01])/;
  const yyMatch = sanitizedText.match(yyRegex);

  if (yyMatch) {
    const fullYear = `20${yyMatch[1]}`;
    return `${fullYear}.${yyMatch[2]}.${yyMatch[3]}`;
  }

  return null;
}
