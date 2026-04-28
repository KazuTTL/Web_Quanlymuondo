export const validatePassword = (_: any, value: string) => {
  if (!value) {
    return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
  }
  if (value.length < 8) {
    return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
  }
  if (!/[a-z]/.test(value)) {
    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một chữ cái thường!'));
  }
  if (!/[A-Z]/.test(value)) {
    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một chữ cái hoa!'));
  }
  if (!/[0-9]/.test(value)) {
    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một số!'));
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'));
  }
  return Promise.resolve();
};
