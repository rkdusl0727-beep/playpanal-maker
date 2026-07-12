import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "어진반 주간 놀이 패널",
  description: "사진과 관찰 메모로 만드는 A4 주간 놀이 기록",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
