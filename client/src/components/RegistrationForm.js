import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Button, Card, Spinner, FloatingLabel } from 'react-bootstrap';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card border-0">
        <Card.Body className="p-0">
            <div className="text-center mb-5">
                <div className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
                    <i className="fas fa-user-plus fa-2x"></i>
                </div>
                <h3 className="fw-bold text-dark">Create Account</h3>
                <p className="text-muted">Join the platform to start managing loans</p>
            </div>

            <Form onSubmit={onSubmit}>
                <FloatingLabel controlId="name" label="Full Name" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="John Doe"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                        className="bg-light border-0"
                    />
                </FloatingLabel>

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
                        minLength="5"
                        className="bg-light border-0"
                    />
                    <Form.Text className="text-muted small">Must be at least 5 characters long.</Form.Text>
                </FloatingLabel>

                <div className="d-grid mb-4">
                    <Button variant="secondary" size="lg" type="submit" disabled={loading} className="shadow-sm">
                        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> : null}
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>
                </div>

                <div className="text-center text-muted">
                    Already have an account? <Link to="/login" className="text-secondary fw-bold text-decoration-none">Sign In</Link>
                </div>
            </Form>
        </Card.Body>
    </Card>
  );
};

export default RegistrationForm;
