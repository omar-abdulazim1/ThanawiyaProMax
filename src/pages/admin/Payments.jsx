import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaMoneyBillWave, FaCheck, FaTimes, FaEye, FaDownload, FaMobileAlt, FaCreditCard, FaWallet } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { paymentAPI, userAPI } from '../../services/backendApi';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAllPayments();
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('فشل تحميل المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payment) => {
    if (!window.confirm(`تأكيد الموافقة على دفع بقيمة ${payment.amount} جنيه؟`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentAPI.approvePayment(payment._id);
      
      if (response.success) {
        toast.success('تم الموافقة على الدفع بنجاح وتحديث الرصيد');
        loadPayments();
      } else {
        throw new Error(response.message || 'فشل الموافقة على الدفع');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error.message || 'فشل الموافقة على الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (payment) => {
    const reason = window.prompt('أدخل سبب الرفض:');
    if (!reason) return;

    setProcessing(true);
    try {
      const response = await paymentAPI.rejectPayment(payment._id, reason);
      
      if (response.success) {
        toast.success('تم رفض الدفع');
        loadPayments();
      } else {
        throw new Error(response.message || 'فشل رفض الدفع');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error.message || 'فشل رفض الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'instapay':
      case 'vodafone':
        return <FaMobileAlt />;
      case 'fawry':
        return <FaMoneyBillWave />;
      case 'bank':
        return <FaUniversity />;
      case 'wallet':
        return <FaWallet />;
      default:
        return <FaMoneyBillWave />;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'قيد المراجعة' },
      completed: { bg: 'success', text: 'مكتمل' },
      failed: { bg: 'danger', text: 'فاشل' },
      rejected: { bg: 'danger', text: 'مرفوض' }
    };
    const s = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={s.bg}>{s.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      deposit: { bg: 'success', text: 'إيداع' },
      withdrawal: { bg: 'danger', text: 'سحب' },
      booking: { bg: 'primary', text: 'حجز' },
      refund: { bg: 'info', text: 'استرداد' }
    };
    const t = typeMap[type] || { bg: 'secondary', text: type };
    return <Badge bg={t.bg}>{t.text}</Badge>;
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'completed');
  const rejectedPayments = payments.filter(p => p.status === 'rejected' || p.status === 'failed');

  if (loading) {
    return <LoadingSpinner fullScreen message="جاري تحميل المدفوعات..." />;
  }

  const PaymentTable = ({ payments, showActions = false }) => (
    <Table responsive hover>
      <thead>
        <tr>
          <th>رقم العملية</th>
          <th>المستخدم</th>
          <th>النوع</th>
          <th>الطريقة</th>
          <th>المبلغ</th>
          <th>التاريخ</th>
          <th>الحالة</th>
          {showActions && <th>الإجراءات</th>}
        </tr>
      </thead>
      <tbody>
        {payments.length === 0 ? (
          <tr>
            <td colSpan={showActions ? 8 : 7} className="text-center text-muted py-4">
              لا توجد مدفوعات
            </td>
          </tr>
        ) : (
          payments.map((payment) => (
            <tr key={payment._id}>
              <td>
                <code className="small">{payment._id?.slice(-8)}</code>
              </td>
              <td>
                {payment.userId?.name || payment.studentId?.name || 'غير معروف'}
              </td>
              <td>{getTypeBadge(payment.type)}</td>
              <td>
                <span className="d-flex align-items-center gap-2">
                  {getPaymentIcon(payment.paymentMethod)}
                  {payment.paymentMethod}
                </span>
              </td>
              <td className="fw-bold">{payment.amount} جنيه</td>
              <td>
                {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
              </td>
              <td>{getStatusBadge(payment.status)}</td>
              {showActions && (
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                    >
                      <FaEye />
                    </Button>
                    {payment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(payment)}
                          disabled={processing}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(payment)}
                          disabled={processing}
                        >
                          <FaTimes />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">إدارة المدفوعات</h2>
          <p className="text-muted mb-0">مراجعة والموافقة على المدفوعات</p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <FaMoneyBillWave className="text-warning" size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">قيد المراجعة</h6>
                  <h3 className="fw-bold mb-0">{pendingPayments.length}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <FaCheck className="text-success" size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">مكتملة</h6>
                  <h3 className="fw-bold mb-0">{completedPayments.length}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                  <FaTimes className="text-danger" size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">مرفوضة</h6>
                  <h3 className="fw-bold mb-0">{rejectedPayments.length}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Tabs defaultActiveKey="pending" className="mb-3">
            <Tab eventKey="pending" title={`قيد المراجعة (${pendingPayments.length})`}>
              <PaymentTable payments={pendingPayments} showActions={true} />
            </Tab>
            <Tab eventKey="completed" title={`مكتملة (${completedPayments.length})`}>
              <PaymentTable payments={completedPayments} showActions={false} />
            </Tab>
            <Tab eventKey="rejected" title={`مرفوضة (${rejectedPayments.length})`}>
              <PaymentTable payments={rejectedPayments} showActions={false} />
            </Tab>
            <Tab eventKey="all" title={`الكل (${payments.length})`}>
              <PaymentTable payments={payments} showActions={true} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Payment Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الدفع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-2">
                    <strong>رقم العملية:</strong>
                    <br />
                    <code>{selectedPayment._id}</code>
                  </p>
                  <p className="mb-2">
                    <strong>المستخدم:</strong>
                    <br />
                    {selectedPayment.userId?.name || selectedPayment.studentId?.name || 'غير معروف'}
                  </p>
                  <p className="mb-2">
                    <strong>البريد الإلكتروني:</strong>
                    <br />
                    {selectedPayment.userId?.email || selectedPayment.studentId?.email || 'غير معروف'}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>نوع العملية:</strong> {getTypeBadge(selectedPayment.type)}
                  </p>
                  <p className="mb-2">
                    <strong>طريقة الدفع:</strong>
                    <br />
                    <span className="d-flex align-items-center gap-2">
                      {getPaymentIcon(selectedPayment.paymentMethod)}
                      {selectedPayment.paymentMethod}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>المبلغ:</strong>
                    <br />
                    <span className="fs-4 fw-bold text-primary">{selectedPayment.amount} جنيه</span>
                  </p>
                  <p className="mb-2">
                    <strong>الحالة:</strong> {getStatusBadge(selectedPayment.status)}
                  </p>
                  <p className="mb-2">
                    <strong>التاريخ:</strong>
                    <br />
                    {new Date(selectedPayment.createdAt).toLocaleString('ar-EG')}
                  </p>
                </Col>
              </Row>

              {selectedPayment.transactionProof && (
                <div className="mt-3">
                  <h6 className="fw-bold">إثبات التحويل:</h6>
                  <Alert variant="info">
                    <p className="mb-0">
                      <strong>اسم الملف:</strong> {selectedPayment.transactionProof}
                    </p>
                    <small className="text-muted">
                      في التطبيق الفعلي، سيتم عرض الصورة هنا
                    </small>
                  </Alert>
                </div>
              )}

              {selectedPayment.bookingId && (
                <div className="mt-3">
                  <h6 className="fw-bold">معلومات الحجز:</h6>
                  <p className="mb-0">
                    <strong>رقم الحجز:</strong> <code>{selectedPayment.bookingId}</code>
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedPayment?.status === 'pending' && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  handleApprove(selectedPayment);
                  setShowModal(false);
                }}
                disabled={processing}
              >
                <FaCheck className="me-2" />
                الموافقة
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleReject(selectedPayment);
                  setShowModal(false);
                }}
                disabled={processing}
              >
                <FaTimes className="me-2" />
                الرفض
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminPayments;
