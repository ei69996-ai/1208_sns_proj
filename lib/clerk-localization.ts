/**
 * Clerk 한국어 로컬라이제이션 설정
 *
 * @clerk/localizations 패키지의 koKR을 기반으로 하며,
 * 필요에 따라 커스텀 한국어 메시지를 추가할 수 있습니다.
 *
 * 사용 방법:
 * ```tsx
 * import { clerkLocalization } from '@/lib/clerk-localization';
 *
 * <ClerkProvider appearance={{ localization: clerkLocalization }}>
 *   ...
 * </ClerkProvider>
 * ```
 *
 * @see {@link https://clerk.com/docs/guides/customizing-clerk/localization Clerk 로컬라이제이션 가이드}
 */

import { koKR } from "@clerk/localizations";

/**
 * 한국어 로컬라이제이션 설정
 *
 * 기본 koKR 로컬라이제이션을 사용하며, 필요시 커스텀 메시지를 추가할 수 있습니다.
 */
export const clerkLocalization = {
  ...koKR,
  // 커스텀 에러 메시지 (필요시 주석 해제하여 사용)
  // unstable__errors: {
  //   ...koKR.unstable__errors,
  //   // 접근이 허용되지 않은 이메일 도메인에 대한 커스텀 메시지
  //   not_allowed_access:
  //     "접근이 허용되지 않은 이메일 도메인입니다. 접근을 원하시면 이메일로 문의해주세요.",
  //   // 비밀번호가 너무 짧을 때
  //   form_password_length_too_short:
  //     "비밀번호는 최소 8자 이상이어야 합니다.",
  //   // 이메일 형식이 잘못되었을 때
  //   form_email_invalid:
  //     "올바른 이메일 주소를 입력해주세요.",
  // },
};

