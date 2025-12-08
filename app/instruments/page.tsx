/**
 * Supabase 공식 Next.js 가이드 예시 페이지
 *
 * 이 페이지는 Supabase 공식 문서의 예시를 기반으로 작성되었습니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 *
 * 사용 방법:
 * 1. Supabase Dashboard에서 'instruments' 테이블 생성
 * 2. RLS 정책 설정 (공개 읽기 허용)
 * 3. 샘플 데이터 삽입
 * 4. 이 페이지에서 데이터 확인
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClerkSupabaseClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-semibold">오류 발생</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <p className="text-red-500 text-xs mt-2">
          테이블이 존재하지 않거나 RLS 정책이 설정되지 않았을 수 있습니다.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">데이터가 없습니다.</p>
        <p className="text-yellow-600 text-sm mt-1">
          Supabase Dashboard에서 샘플 데이터를 삽입해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">악기 목록</h2>
      <ul className="list-disc list-inside space-y-2">
        {instruments.map((instrument: any) => (
          <li key={instrument.id} className="text-gray-700">
            {instrument.name}
          </li>
        ))}
      </ul>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          원시 데이터 보기
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase 연결 테스트</h1>
      <p className="text-gray-600 mb-6">
        이 페이지는 Supabase 공식 Next.js 가이드의 예시를 기반으로
        작성되었습니다.
      </p>

      <Suspense fallback={<div>Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">설정 가이드</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>
            Supabase Dashboard → SQL Editor에서 다음 SQL 실행:
          </li>
        </ol>
        <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto">
          {`-- 테이블 생성
CREATE TABLE IF NOT EXISTS instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO instruments (name)
VALUES
  ('violin'),
  ('viola'),
  ('cello');

-- RLS 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 추가
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);`}
        </pre>
      </div>
    </div>
  );
}

