import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { isValidEmail, isValidPhone } from '../utils/helpers';

function Login() {
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const identifier = activeTab === 'email' ? email : phone;
    
    if (!identifier || !password) {
      setError('يرجى ملء جميع الحقول');
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (activeTab === 'email' && !isValidEmail(email)) {
      setError('البريد الإلكتروني غير صحيح');
      setIsLoading(false);
      return;
    }

    // Validate Egyptian phone number format (currently backend uses email only)
    if (activeTab === 'phone' && !isValidPhone(phone)) {
      setError('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(identifier, password);
      
      if (result.success && result.user) {
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'tutor') {
          navigate('/tutor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(result.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h1 className="text-center mb-4 fw-bold">تسجيل الدخول</h1>
              
              {error && <Alert variant="danger" role="alert">{error}</Alert>}

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
                justify
                aria-label="طرق تسجيل الدخول"
              >
                <Tab eventKey="email" title={<span><FaEnvelope className="me-2" aria-hidden="true" />البريد الإلكتروني</span>}>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="email-input">البريد الإلكتروني</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden="true">
                          <FaEnvelope />
                        </span>
                        <Form.Control
                          id="email-input"
                          type="email"
                          placeholder="أدخل البريد الإلكتروني"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          aria-required="true"
                          autoComplete="email"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label htmlFor="password-input">كلمة المرور</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden="true">
                          <FaLock />
                        </span>
                        <Form.Control
                          id="password-input"
                          type="password"
                          placeholder="أدخل كلمة المرور"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          aria-required="true"
                          autoComplete="current-password"
                        />
                      </div>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2 mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          جاري تسجيل الدخول...
                        </>
                      ) : (
                        'تسجيل الدخول'
                      )}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="phone" title={<span><FaPhone className="me-2" aria-hidden="true" />رقم الهاتف</span>}>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="phone-input">رقم الهاتف</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden="true">
                          <FaPhone />
                        </span>
                        <Form.Control
                          id="phone-input"
                          type="tel"
                          placeholder="مثال: 01012345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          pattern="01[0-2,5]{1}[0-9]{8}"
                          maxLength="11"
                          required
                          aria-required="true"
                          autoComplete="tel"
                          aria-describedby="phone-help"
                        />
                      </div>
                      <Form.Text id="phone-help" className="text-muted d-block">
                        رقم مصري يبدأ بـ 010، 011، 012، أو 015 (11 رقم)
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label htmlFor="password-phone-input">كلمة المرور</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden="true">
                          <FaLock />
                        </span>
                        <Form.Control
                          id="password-phone-input"
                          type="password"
                          placeholder="أدخل كلمة المرور"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          aria-required="true"
                          autoComplete="current-password"
                        />
                      </div>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2 mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          جاري تسجيل الدخول...
                        </>
                      ) : (
                        'تسجيل الدخول'
                      )}
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              <div className="text-center">
                <p className="text-muted">
                  ليس لديك حساب؟{' '}
                  <Link to="/register" className="text-decoration-none">
                    سجل الآن
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default Login;
