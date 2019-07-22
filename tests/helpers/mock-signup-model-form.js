export function mockSignUpFormModelData({
  email = 'some@email.com',
  username = 'userName',
  password = 'qwerty12345',
  confirmPassword = 'qwerty12345'
} = {}) {
  return { email, username, password, confirmPassword };
}
