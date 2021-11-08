export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToken) {
    return  'Bearer ' + user.accessToken ; // for Spring Boot back-end

  } else {
    return {};
  }
}
