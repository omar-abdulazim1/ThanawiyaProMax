import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Badge, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCreditCard, FaMobileAlt, FaCheckCircle, FaUniversity, FaLock, FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { bookingAPI, paymentAPI } from '../services/backendApi';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {
    tutorName: 'محمد حسن إبراهيم',
    subject: 'الرياضيات',
    date: '2025-11-25',
    time: '16:00',
    duration: '1.5 ساعة',
    hourlyRate: 60,
    totalHours: 1.5
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [useWallet, setUseWallet] = useState(true);
  const [paidAmount, setPaidAmount] = useState('');
  const [transactionProof, setTransactionProof] = useState(null);
  const [transactionProofPreview, setTransactionProofPreview] = useState(null);

  // Mock payment methods - in real app, fetch from user profile
  const paymentMethods = [
    {
      id: 1,
      type: 'instapay',
      name: 'إنستاباي',
      details: '01012345678',
      icon: <FaMobileAlt />,
      color: 'primary',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      name: 'بطاقة بنكية',
      details: '**** **** **** 1234',
      icon: <FaCreditCard />,
      color: 'success',
      isDefault: false
    },
    {
      id: 3,
      type: 'vodafone',
      name: 'فودافون كاش',
      details: '01123456789',
      icon: <FaMobileAlt />,
      color: 'danger',
      isDefault: false
    }
  ];

  // Auto-select default payment method on mount
  useEffect(() => {
    const defaultMethod = paymentMethods.find(method => method.isDefault);
    if (defaultMethod) {
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, []);

  const subtotal = bookingData.hourlyRate * bookingData.totalHours;
  const platformFee = subtotal * 0.05; // 5% platform fee
  const total = subtotal + platformFee;

  const handlePayment = () => {
    if (!useWallet) {
      // Instapay validation
      if (!paidAmount || parseFloat(paidAmount) < total) {
        setError(`يرجى إدخال المبلغ المحول (المطلوب: ${total.toFixed(2)} جنيه)`);
        return;
      }
      if (!transactionProof) {
        setError('يرجى رفع صورة إثبات التحويل');
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const confirmPayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // Validate tutorId exists
      if (!bookingData.tutorId) {
        throw new Error('معلومات المدرس غير متوفرة. يرجى العودة واختيار المدرس مرة أخرى');
      }

      // Create booking in backend
      const bookingPayload = {
        tutorId: bookingData.tutorId, // User ID from TutorProfile
        subject: bookingData.subject,
        sessionDate: new Date(`${bookingData.date}T${bookingData.time}`).toISOString(),
        duration: typeof bookingData.duration === 'number' ? bookingData.duration : parseFloat(bookingData.totalHours) * 60,
        location: 'online',
        notes: bookingData.notes || '',
        totalPrice: total
      };

      console.log('Creating booking with payload:', bookingPayload);

      const bookingResponse = await bookingAPI.createBooking(bookingPayload);
      
      if (bookingResponse.success) {
        // Create payment record
        const paymentPayload = {
          bookingId: bookingResponse.data._id,
          amount: total,
          paymentMethod: useWallet ? 'wallet' : selectedPaymentMethod,
          type: 'booking'
        };

        // Add transaction proof info if using mobile payment
        if (!useWallet) {
          paymentPayload.transactionProof = transactionProof.name; // In real app, upload to server first
          paymentPayload.paidAmount = parseFloat(paidAmount);
        }

        const paymentResponse = await paymentAPI.createPayment(paymentPayload);
        
        if (paymentResponse.success) {
          setProcessing(false);
          setShowConfirmModal(false);
          
          if (useWallet) {
            toast.success('تم تأكيد الحجز والدفع بنجاح!');
          } else {
            toast.success('تم إرسال طلب الحجز! سيتم تأكيده خلال 24 ساعة بعد مراجعة الدفع');
          }
          
          // Navigate to bookings page
          navigate('/student/bookings', {
            state: {
              success: true,
              message: useWallet 
                ? 'تم تأكيد الحجز والدفع بنجاح! ستتلقى إشعاراً قريباً'
                : 'تم إرسال طلب الحجز. سيتم التأكيد خلال 24 ساعة بعد مراجعة الدفع'
            }
          });
        } else {
          throw new Error('فشل إنشاء الدفع');
        }
      } else {
        throw new Error(bookingResponse.message || 'فشل إنشاء الحجز');
      }
    } catch (error) {
      setProcessing(false);
      setError(error.message || 'حدث خطأ أثناء معالجة الدفع');
      toast.error(error.message || 'فشل إتمام الحجز. يرجى المحاولة مرة أخرى');
      setShowConfirmModal(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 fw-bold">إتمام الحجز والدفع</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Booking Summary */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3">ملخص الحجز</h5>
                <Card className="border">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p className="mb-2">
                          <strong>المدرس:</strong> {bookingData.tutorName}
                        </p>
                        <p className="mb-2">
                          <strong>المادة:</strong> {bookingData.subject}
                        </p>
                        <p className="mb-0">
                          <strong>المدة:</strong> {bookingData.duration}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-2">
                          <strong>التاريخ:</strong> {new Date(bookingData.date).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="mb-2">
                          <strong>الوقت:</strong> {bookingData.time}
                        </p>
                        <p className="mb-0">
                          <strong>السعر/ساعة:</strong> {bookingData.hourlyRate} جنيه
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3">اختر طريقة الدفع</h5>
                
                {/* Wallet Payment Option */}
                <Card 
                  className={`border mb-3 ${useWallet ? 'border-success border-2' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setUseWallet(true);
                    setSelectedPaymentMethod(null);
                  }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <FaWallet className="text-success me-3" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">الدفع من المحفظة</div>
                      <small className="text-muted">
                        الرصيد المتاح: <strong>1000</strong> جنيه
                      </small>
                    </div>
                    {useWallet && <FaCheckCircle className="text-success" size={24} />}
                  </Card.Body>
                </Card>
                
                {/* Mobile Payment Options */}
                <Card 
                  className={`border mb-3 ${!useWallet && selectedPaymentMethod === 'instapay' ? 'border-primary border-2' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setUseWallet(false);
                    setSelectedPaymentMethod('instapay');
                  }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <FaMobileAlt className="text-primary me-3" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">إنستاباي (Instapay)</div>
                      <small className="text-muted">
                        تحويل فوري عبر إنستاباي
                      </small>
                    </div>
                    {!useWallet && selectedPaymentMethod === 'instapay' && <FaCheckCircle className="text-success" size={24} />}
                  </Card.Body>
                </Card>

                <Card 
                  className={`border mb-3 ${!useWallet && selectedPaymentMethod === 'vodafone' ? 'border-danger border-2' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setUseWallet(false);
                    setSelectedPaymentMethod('vodafone');
                  }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <FaMobileAlt className="text-danger me-3" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">فودافون كاش (Vodafone Cash)</div>
                      <small className="text-muted">
                        تحويل عبر فودافون كاش
                      </small>
                    </div>
                    {!useWallet && selectedPaymentMethod === 'vodafone' && <FaCheckCircle className="text-success" size={24} />}
                  </Card.Body>
                </Card>

                <Card 
                  className={`border mb-3 ${!useWallet && selectedPaymentMethod === 'bank' ? 'border-info border-2' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setUseWallet(false);
                    setSelectedPaymentMethod('bank');
                  }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <FaUniversity className="text-info me-3" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">تحويل بنكي (Bank Transfer)</div>
                      <small className="text-muted">
                        تحويل بنكي مباشر
                      </small>
                    </div>
                    {!useWallet && selectedPaymentMethod === 'bank' && <FaCheckCircle className="text-success" size={24} />}
                  </Card.Body>
                </Card>

                <Card 
                  className={`border mb-3 ${!useWallet && selectedPaymentMethod === 'fawry' ? 'border-warning border-2' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setUseWallet(false);
                    setSelectedPaymentMethod('fawry');
                  }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <FaMoneyBillWave className="text-warning me-3" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">فوري (Fawry)</div>
                      <small className="text-muted">
                        الدفع عبر فوري
                      </small>
                    </div>
                    {!useWallet && selectedPaymentMethod === 'fawry' && <FaCheckCircle className="text-success" size={24} />}
                  </Card.Body>
                </Card>

                {/* Mobile Payment Details */}
                {!useWallet && selectedPaymentMethod === 'instapay' && (
                  <Alert variant="info" className="mt-3">
                    <h6 className="fw-bold mb-2">📱 خطوات الدفع عبر إنستاباي:</h6>
                    <ol className="mb-0">
                      <li>قم بتحويل المبلغ إلى: <strong dir="ltr">thanawiyapro@instapay</strong></li>
                      <li>أدخل المبلغ المحول أدناه</li>
                      <li>قم برفع صورة إثبات التحويل</li>
                      <li>اضغط على "تأكيد الدفع"</li>
                    </ol>
                    
                    <Card className="bg-white border-0 mt-3 p-2">
                      <div className="text-center">
                        <FaMobileAlt size={30} className="text-primary mb-2" />
                        <h6 className="mb-1">عنوان إنستاباي</h6>
                        <h5 className="fw-bold text-primary mb-0" dir="ltr">thanawiyapro@instapay</h5>
                      </div>
                    </Card>

                    <Form.Group className="mt-3">
                      <Form.Label>المبلغ المحول</Form.Label>
                      <Form.Control
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="أدخل المبلغ المحول"
                        min={total}
                        step="0.01"
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                      />
                      <Form.Text className="text-muted">
                        المبلغ المطلوب: {total.toFixed(2)} جنيه
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label>إثبات التحويل (صورة)</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setTransactionProof(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTransactionProofPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Form.Group>

                    {transactionProofPreview && (
                      <div className="text-center mt-3">
                        <img 
                          src={transactionProofPreview} 
                          alt="Transaction Proof" 
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                          className="border"
                        />
                      </div>
                    )}
                  </Alert>
                )}

                {!useWallet && selectedPaymentMethod === 'vodafone' && (
                  <Alert variant="danger" className="mt-3">
                    <h6 className="fw-bold mb-2">📱 خطوات الدفع عبر فودافون كاش:</h6>
                    <ol className="mb-0">
                      <li>قم بتحويل المبلغ إلى الرقم: <strong dir="ltr">01001234567</strong></li>
                      <li>أدخل المبلغ المحول أدناه</li>
                      <li>قم برفع صورة إثبات التحويل</li>
                      <li>اضغط على "تأكيد الدفع"</li>
                    </ol>
                    
                    <Card className="bg-white border-0 mt-3 p-2">
                      <div className="text-center">
                        <FaMobileAlt size={30} className="text-danger mb-2" />
                        <h6 className="mb-1">رقم فودافون كاش</h6>
                        <h5 className="fw-bold text-danger mb-0" dir="ltr">01001234567</h5>
                      </div>
                    </Card>

                    <Form.Group className="mt-3">
                      <Form.Label>المبلغ المحول</Form.Label>
                      <Form.Control
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="أدخل المبلغ المحول"
                        min={total}
                        step="0.01"
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                      />
                      <Form.Text className="text-muted">
                        المبلغ المطلوب: {total.toFixed(2)} جنيه
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label>إثبات التحويل (صورة)</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setTransactionProof(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTransactionProofPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Form.Group>

                    {transactionProofPreview && (
                      <div className="text-center mt-3">
                        <img 
                          src={transactionProofPreview} 
                          alt="Transaction Proof" 
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                          className="border"
                        />
                      </div>
                    )}
                  </Alert>
                )}

                {!useWallet && selectedPaymentMethod === 'bank' && (
                  <Alert variant="info" className="mt-3">
                    <h6 className="fw-bold mb-2">🏦 خطوات الدفع عبر التحويل البنكي:</h6>
                    <ol className="mb-0">
                      <li>قم بتحويل المبلغ إلى الحساب البنكي أدناه</li>
                      <li>أدخل المبلغ المحول أدناه</li>
                      <li>قم برفع صورة إثبات التحويل (إيصال بنكي)</li>
                      <li>اضغط على "تأكيد الدفع"</li>
                    </ol>
                    
                    <Card className="bg-white border-0 mt-3 p-3">
                      <div>
                        <FaUniversity size={30} className="text-info mb-3" />
                        <h6 className="mb-2">تفاصيل الحساب البنكي</h6>
                        <ListGroup variant="flush">
                          <ListGroup.Item><strong>اسم البنك:</strong> بنك مصر</ListGroup.Item>
                          <ListGroup.Item><strong>رقم الحساب:</strong> <span dir="ltr">1234567890123456</span></ListGroup.Item>
                          <ListGroup.Item><strong>IBAN:</strong> <span dir="ltr">EG380002001234567890123456789</span></ListGroup.Item>
                          <ListGroup.Item><strong>اسم المستفيد:</strong> ثانوية برو للخدمات التعليمية</ListGroup.Item>
                        </ListGroup>
                      </div>
                    </Card>

                    <Form.Group className="mt-3">
                      <Form.Label>المبلغ المحول</Form.Label>
                      <Form.Control
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="أدخل المبلغ المحول"
                        min={total}
                        step="0.01"
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                      />
                      <Form.Text className="text-muted">
                        المبلغ المطلوب: {total.toFixed(2)} جنيه
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label>إثبات التحويل (صورة الإيصال البنكي)</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setTransactionProof(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTransactionProofPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Form.Group>

                    {transactionProofPreview && (
                      <div className="text-center mt-3">
                        <img 
                          src={transactionProofPreview} 
                          alt="Transaction Proof" 
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                          className="border"
                        />
                      </div>
                    )}
                  </Alert>
                )}

                {!useWallet && selectedPaymentMethod === 'fawry' && (
                  <Alert variant="warning" className="mt-3">
                    <h6 className="fw-bold mb-2">💳 خطوات الدفع عبر فوري:</h6>
                    <ol className="mb-0">
                      <li>اذهب إلى أقرب فرع فوري أو ماكينة فوري</li>
                      <li>استخدم الكود: <strong>8374629</strong></li>
                      <li>أدخل المبلغ المدفوع أدناه</li>
                      <li>قم برفع صورة إيصال الدفع من فوري</li>
                      <li>اضغط على "تأكيد الدفع"</li>
                    </ol>
                    
                    <Card className="bg-white border-0 mt-3 p-3">
                      <div className="text-center">
                        <FaMoneyBillWave size={30} className="text-warning mb-2" />
                        <h6 className="mb-1">كود فوري</h6>
                        <h3 className="fw-bold text-warning mb-1" dir="ltr">8374629</h3>
                        <p className="mb-0 small text-muted">استخدم هذا الكود في أي فرع أو ماكينة فوري</p>
                      </div>
                    </Card>

                    <Form.Group className="mt-3">
                      <Form.Label>المبلغ المدفوع</Form.Label>
                      <Form.Control
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="أدخل المبلغ المدفوع"
                        min={total}
                        step="0.01"
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                      />
                      <Form.Text className="text-muted">
                        المبلغ المطلوب: {total.toFixed(2)} جنيه
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label>إيصال الدفع من فوري (صورة)</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setTransactionProof(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTransactionProofPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Form.Group>

                    {transactionProofPreview && (
                      <div className="text-center mt-3">
                        <img 
                          src={transactionProofPreview} 
                          alt="Transaction Proof" 
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                          className="border"
                        />
                      </div>
                    )}
                  </Alert>
                )}
                
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate('/student/payment-methods')}
                  >
                    شحن المحفظة
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3">تفاصيل المبلغ</h5>
                <Card className="border">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>سعر الحصة ({bookingData.totalHours} ساعة)</span>
                      <span>{subtotal.toFixed(2)} جنيه</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>رسوم المنصة (5%)</span>
                      <span>{platformFee.toFixed(2)} جنيه</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>الإجمالي</span>
                      <span className="text-primary">{total.toFixed(2)} جنيه</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Security Notice */}
              <Alert variant="info" className="mb-4">
                <FaLock className="me-2" />
                <small>
                  جميع المعاملات محمية بتشفير SSL. لن يتم خصم المبلغ إلا بعد تأكيد المدرس للحجز.
                </small>
              </Alert>

              {/* Action Buttons */}
              <div className="d-flex gap-3">
                <Button
                  variant="outline-secondary"
                  className="flex-grow-1"
                  onClick={() => navigate(-1)}
                >
                  العودة
                </Button>
                <Button
                  variant="primary"
                  className="flex-grow-1"
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || paymentMethods.length === 0}
                >
                  تأكيد الدفع والحجز
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Additional Info */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light">
              <h6 className="mb-0 fw-bold">سياسة الإلغاء</h6>
            </Card.Header>
            <Card.Body>
              <ul className="mb-0 pe-3">
                <li className="mb-2">يمكنك إلغاء الحجز قبل 24 ساعة من الموعد واسترداد المبلغ كاملاً</li>
                <li className="mb-2">الإلغاء قبل 12 ساعة من الموعد: استرداد 50%</li>
                <li className="mb-0">لا يمكن استرداد المبلغ في حالة الإلغاء قبل أقل من 12 ساعة</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => !processing && setShowConfirmModal(false)} centered>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>تأكيد الدفع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {processing ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">جاري المعالجة...</span>
              </div>
              <p className="mb-0">جاري معالجة الدفع، يرجى الانتظار...</p>
            </div>
          ) : (
            <>
              <p className="mb-3">
                هل أنت متأكد من إتمام الدفع بمبلغ <strong className="text-primary">{total.toFixed(2)} جنيه</strong> عن طريق{' '}
                <strong>{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</strong>؟
              </p>
              <Alert variant="warning" className="mb-0">
                <small>
                  <strong>ملاحظة:</strong> سيتم خصم المبلغ فوراً من طريقة الدفع المحددة
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        {!processing && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={confirmPayment}>
              تأكيد الدفع
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
}

export default Checkout;
