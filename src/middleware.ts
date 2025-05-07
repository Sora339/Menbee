// middleware.ts (プロジェクトルートに配置)
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '../auth';

// ログイン不要なパス
const publicPaths = ['/login', '/', '/terms', '/privacy'];

export async function middleware(request: NextRequest) {
  // 現在のパスを取得
  const path = request.nextUrl.pathname;
  
  // 現在のパスが公開パスかどうかをチェック
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  );

  // 静的アセットなどのパスはスキップ
  if (
    path.startsWith('/_next') || 
    path.includes('favicon.ico') ||
    path.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // 認証状態を確認
  const session = await auth();
  const isAuthenticated = !!session;
  
  // デバッグ用ログ
  console.log(`Path: ${path}, Auth: ${isAuthenticated}, Public: ${isPublicPath}`);

  // 未認証ユーザーが保護されたページにアクセスしようとした場合
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    // 元のURLをクエリパラメータとして保存
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // 認証済みユーザーがログインページにアクセスしようとした場合
  if (isAuthenticated && path === '/login') {
    return NextResponse.redirect(new URL('/myPage', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};