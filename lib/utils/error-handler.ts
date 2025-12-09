/**
 * @file error-handler.ts
 * @description 에러 핸들링 유틸리티 함수
 *
 * API 및 클라이언트에서 사용할 수 있는 에러 처리 함수들
 */

/**
 * 에러 객체에서 사용자 친화적 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 네트워크 에러 메시지 변환
 */
export function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "네트워크 연결을 확인해주세요.";
  }
  if (error instanceof Error && error.message.includes("Failed to fetch")) {
    return "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
  }
  return getErrorMessage(error);
}

/**
 * API 에러 응답에서 메시지 추출
 */
export async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data.error) {
      return data.error;
    }
  } catch {
    // JSON 파싱 실패 시 기본 메시지 사용
  }

  // HTTP 상태 코드에 따른 기본 메시지
  switch (response.status) {
    case 400:
      return "잘못된 요청입니다.";
    case 401:
      return "로그인이 필요합니다.";
    case 403:
      return "권한이 없습니다.";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다.";
    case 409:
      return "이미 처리된 요청입니다.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 에러 타입 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes("fetch") || error.message.includes("network");
  }
  if (error instanceof Error) {
    return error.message.includes("Failed to fetch") || error.message.includes("NetworkError");
  }
  return false;
}

