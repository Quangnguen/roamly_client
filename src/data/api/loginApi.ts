export const loginApi = async (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    if (email === 'quang@gmail.com' && password === '123') {
      resolve({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        token: 'fake-jwt-token',
      })
    } else {
      reject(new Error('Email hoặc mật khẩu không đúng'))
    }
  })
}
