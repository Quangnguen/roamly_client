export const registerApi = async (
  email: string,
  password: string,
  name: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // fake delay

  if (email === 'fail@example.com') {
    throw new Error('Email đã tồn tại')
  }

  return {
    id: Date.now().toString(),
    email,
    name,
    token: 'fake_token_register',
  }
}
