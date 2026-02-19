import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from '../../../auth/AuthProvider';
import heroImg from "../../assets/login-hero.jpg";

const { Title, Paragraph, Link } = Typography;

export function LoginContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

        const onFinish = async (values: any) => {
            const username = values.username?.trim();
            const password = values.password;
            try {
                const success = await auth.login(username, password);
                if (success) {
                    messageApi.success('Signed in');
                    // redirect back to the original location (if provided)
                    const from = (location.state as any)?.from?.pathname || '/';
                    navigate(from, { replace: true });
                } else {
                    messageApi.error('Invalid username or password');
                }
            } catch (err) {
                console.error(err);
                messageApi.error('Login failed');
            }
        };

    return (
        <>
        {contextHolder}
        <div className="flex flex-col md:flex-row-reverse min-h-screen">
            <div
                className="md:w-1/2 w-full h-56 md:h-auto"
                style={{
                    backgroundImage: `url(${heroImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="md:w-1/2 w-full flex items-center justify-center bg-white">
                <div className="w-full max-w-md p-8">
                    <div className="pb-4">
                        <Title level={1} >Welcome Back</Title>
                        <Title level={5} className="regular">Sign in to continue to your account.</Title>
                    </div>
                    
                    <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: "Please input your username" }]}
                        >
                                <Input prefix={<UserOutlined />} placeholder="Username" disabled={auth.loading} />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: "Please input your password" }]}
                        >
                                <Input.Password prefix={<LockOutlined />} placeholder="Password" disabled={auth.loading} />
                        </Form.Item>

                        <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={auth.loading} disabled={auth.loading}>
                                    Login
                                </Button>
                        </Form.Item>
                        <Paragraph>
                            New to GreenLight?  <Link strong href="#">Create an account</Link>
                        </Paragraph>
                        <Paragraph>
                            Forgot Password?  <Link strong href="#">Retrieve Login</Link>
                        </Paragraph>
                    </Form>
                </div>
            </div>
        </div>
        </>
    );
}

export default LoginContent;