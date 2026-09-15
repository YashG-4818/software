import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ token, req }) {
      if (!token) return false;

      const path = req.nextUrl.pathname;
      if (path.startsWith('/admin')) return token.role === 'ADMIN';
      if (path.startsWith('/driver')) return token.role === 'DRIVER' || token.role === 'ADMIN';
      return true;
    },
  },
});

export const config = {
  matcher: ['/book/:path*', '/payment/:path*', '/ticket/:path*', '/admin/:path*', '/driver/:path*'],
};