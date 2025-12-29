import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "./auth-layout";
import { LoginForm } from "../forms/login-form";

export function Login() {
  return (
    <Auth imgSrc="https://cdn.dribbble.com/userupload/19072003/file/original-334597fdfcc35cf74902a75a79c27423.jpg?resize=1200x1200&vertical=center">
      <AuthHeader>
        <AuthTitle>Login</AuthTitle>
        <AuthDescription>
          Enter your email below to login to your account
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <LoginForm />
      </AuthForm>
    </Auth>
  );
}
