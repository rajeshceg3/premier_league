import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Button, Card, Spinner, FloatingLabel } from 'react-bootstrap';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card border-0">
        <Card.Body className="p-0">
            <div className="text-center mb-5">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
                    <i className="fas fa-futbol fa-2x"></i>
                </div>
                <h3 className="fw-bold text-dark">Welcome Back</h3>
                <p className="text-muted">Sign in to manage your loan portfolio</p>
            </div>

            <Form onSubmit={onSubmit}>
                <FloatingLabel controlId="email" label="Email Address" className="mb-3">
                    <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="bg-light border-0"
                    />
                </FloatingLabel>

                <FloatingLabel controlId="password" label="Password" className="mb-4">
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        className="bg-light border-0"
                    />
                </FloatingLabel>

                <div className="d-grid mb-4">
                    <Button variant="primary" size="lg" type="submit" disabled={loading} className="shadow-sm">
                        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> : null}
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </div>

                <div className="text-center text-muted">
                    Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create Account</Link>
                </div>
            </Form>
        </Card.Body>
    </Card>
  );
};

export default LoginForm;
