import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Multiple ways to delete cookie - ENSURE it's gone
    response.cookies.delete('token');
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });

    // Also try to clear adminToken cookie if it exists
    response.cookies.delete('adminToken');
    response.cookies.set('adminToken', '', {
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}