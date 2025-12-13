import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Table, Badge, Form, Button, Modal, Alert } from 'react-bootstrap';
import { FaMoneyBillWave, FaChartLine, FaCalendar, FaDownload, FaWallet } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI, bookingAPI } from '../../services/backendApi';
import { toast } from 'react-toastify';

function TutorEarnings() {
  const { user, refreshUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('instapay');
  const [processing, setProcessing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [earningsStats, setEarningsStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingPayments: 0,
    totalSessions: 0,
    averagePerSession: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, [user]);

  const fetchEarningsData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch bookings and payments
      const [bookingsResponse, paymentsResponse] = await Promise.all([
        bookingAPI.getAllBookings(),
        paymentAPI.getAllPayments()
      ]);
      
      if (bookingsResponse.success && paymentsResponse.success) {
        const allBookings = bookingsResponse.data || [];
        const allPayments = paymentsResponse.data || [];
        
        // Filter tutor's bookings
        const tutorBookings = allBookings.filter(b => 
          (b.tutorId?._id === user.tutorProfile?._id || b.tutorId === user.tutorProfile?._id) &&
          b.status === 'completed'
        );
        
        // Filter tutor's payments (booking type)
        const tutorPayments = allPayments.filter(p => 
          p.userId?._id === user._id || p.userId === user._id
        );
        
        // Calculate stats
        const completedPayments = tutorPayments.filter(p => p.status === 'completed' && p.type === 'booking');
        const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const thisMonthEarnings = completedPayments
          .filter(p => new Date(p.createdAt) >= thisMonthStart)
          .reduce((sum, p) => sum + p.amount, 0);
        
        const lastMonthEarnings = completedPayments
          .filter(p => {
            const date = new Date(p.createdAt);
            return date >= lastMonthStart && date <= lastMonthEnd;
          })
          .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingPayments = tutorPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);
        
        setEarningsStats({
          totalEarnings,
          thisMonth: thisMonthEarnings,
          lastMonth: lastMonthEarnings,
          pendingPayments,
          totalSessions: tutorBookings.length,
          averagePerSession: tutorBookings.length > 0 ? Math.round(totalEarnings / tutorBookings.length) : 0
        });
        
        // Calculate monthly breakdown
        const monthlyData = {};
        completedPayments.forEach(p => {
          const date = new Date(p.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { earnings: 0, sessions: 0 };
          }
          monthlyData[monthKey].earnings += p.amount;
          monthlyData[monthKey].sessions += 1;
        });
        
        const monthlyArray = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => b.month.localeCompare(a.month))
          .slice(0, 5);
        
        setMonthlyEarnings(monthlyArray);
        
        // Recent transactions from bookings
        const transactions = tutorBookings
          .sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate))
          .slice(0, 10)
          .map(b => ({
            id: b._id,
            date: new Date(b.sessionDate).toISOString().split('T')[0],
            studentName: b.studentId?.name || 'طالب',
            subject: b.subject,
            duration: `${b.duration} ساعة`,
            amount: b.totalPrice,
            status: 'completed'
          }));
        
        setRecentTransactions(transactions);
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'completed' ? (
      <Badge bg="success">مكتملة</Badge>
    ) : (
      <Badge bg="warning" text="dark">قيد الانتظار</Badge>
    );
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    const minWithdrawal = 100;
    
    if (amount < minWithdrawal) {
      toast.error(`الحد الأدنى للسحب ${minWithdrawal} جنيه`);
      return;
    }
    
    if (amount > (user?.balance || 0)) {
      toast.error('الرصيد المتاح غير كافٍ');
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await paymentAPI.withdrawal({
        amount,
        paymentMethod: selectedPaymentMethod,
        type: 'withdrawal'
      });
      
      if (response.success) {
        toast.success('تم إرسال طلب السحب! سيتم مراجعته خلال 24 ساعة');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        await refreshUser();
      } else {
        toast.error('فشل إرسال طلب السحب');
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <FaMoneyBillWave className="me-2 text-success" />
            الأرباح والمدفوعات
          </h1>
          <p className="text-muted mb-0">
            رصيدك المتاح: <strong className="text-success">{user?.balance || 0}</strong> جنيه
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            onClick={() => setShowWithdrawModal(true)}
            disabled={!user?.balance || user.balance < 100}
          >
            <FaWallet className="me-1" />
            سحب الأرباح
          </Button>
          <Button variant="primary">
            <FaDownload className="me-1" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Earnings Statistics */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid var(--bs-success)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">إجمالي الأرباح</p>
                  <h2 className="h3 mb-0 fw-bold text-success">{earningsStats.totalEarnings} جنيه</h2>
                  <small className="text-muted">{earningsStats.totalSessions} حصة مكتملة</small>
                </div>
                <FaChartLine size={40} className="text-success opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid var(--bs-primary)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">أرباح هذا الشهر</p>
                  <h2 className="h3 mb-0 fw-bold text-primary">{earningsStats.thisMonth} جنيه</h2>
                  {earningsStats.lastMonth > 0 && (
                    <small className="text-success">
                      ↑ {Math.round(((earningsStats.thisMonth - earningsStats.lastMonth) / earningsStats.lastMonth) * 100)}% عن الشهر الماضي
                    </small>
                  )}
                </div>
                <FaCalendar size={40} className="text-primary opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid var(--bs-warning)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">المدفوعات المعلقة</p>
                  <h2 className="h3 mb-0 fw-bold text-warning">{earningsStats.pendingPayments} جنيه</h2>
                  <small className="text-muted">سيتم الدفع قريباً</small>
                </div>
                <div className="text-warning opacity-50" style={{ fontSize: '2.5rem' }}>⏳</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Monthly Breakdown */}
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h2 className="h5 mb-4">الأرباح الشهرية</h2>
              <div className="table-responsive">
                <Table className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>الشهر</th>
                      <th>الحصص</th>
                      <th>الأرباح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">جاري التحميل...</span>
                          </div>
                        </td>
                      </tr>
                    ) : monthlyEarnings.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">
                          لا توجد بيانات
                        </td>
                      </tr>
                    ) : monthlyEarnings.map((item) => (
                      <tr key={item.month}>
                        <td className="fw-bold">{item.month}</td>
                        <td>{item.sessions}</td>
                        <td className="text-success fw-bold">{item.earnings} جنيه</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">متوسط الأرباح لكل حصة:</span>
                  <strong className="text-success">{earningsStats.averagePerSession} جنيه</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">متوسط الأرباح الشهرية:</span>
                  <strong className="text-primary">
                    {monthlyEarnings.length > 0 ? Math.round(monthlyEarnings.reduce((sum, m) => sum + m.earnings, 0) / monthlyEarnings.length) : 0} جنيه
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Transactions */}
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">المعاملات الأخيرة</h2>
                <Form.Select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ width: '150px' }}
                  size="sm"
                >
                  <option value="2025-11">نوفمبر 2025</option>
                  <option value="2025-10">أكتوبر 2025</option>
                  <option value="2025-09">سبتمبر 2025</option>
                  <option value="2025-08">أغسطس 2025</option>
                </Form.Select>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>التاريخ</th>
                      <th>الطالب</th>
                      <th>المادة</th>
                      <th>المدة</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">جاري التحميل...</span>
                          </div>
                        </td>
                      </tr>
                    ) : recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          لا توجد معاملات
                        </td>
                      </tr>
                    ) : recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="small">{transaction.date}</td>
                        <td className="fw-bold">{transaction.studentName}</td>
                        <td>
                          <Badge bg="primary" className="small">{transaction.subject}</Badge>
                        </td>
                        <td className="small">{transaction.duration}</td>
                        <td className="text-success fw-bold">{transaction.amount} جنيه</td>
                        <td>{getStatusBadge(transaction.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Info */}
      <Card className="shadow-sm border-0">
        <Card.Body className="bg-light">
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="h6 mb-2">💡 معلومات الدفع</h3>
              <p className="small text-muted mb-0">
                يتم تحويل الأرباح إلى حسابك البنكي في نهاية كل شهر. المدفوعات المعلقة تشمل الحصص التي لم تكتمل بعد.
                يرجى التأكد من تحديث معلومات الحساب البنكي في إعدادات الملف الشخصي.
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-primary" size="sm">
                تحديث معلومات الدفع
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Withdraw Modal */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaWallet className="me-2" />
            سحب الأرباح
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleWithdraw}>
          <Modal.Body>
            <Alert variant="info">
              <strong>رصيدك المتاح:</strong> {user?.balance || 0} جنيه<br/>
              <strong>الحد الأدنى للسحب:</strong> 100 جنيه<br/>
              <strong>مدة المعالجة:</strong> 3-5 أيام عمل
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>المبلغ المراد سحبه</Form.Label>
              <Form.Control
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                min="100"
                max={user?.balance || 0}
                step="10"
                required
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
              <Form.Text className="text-muted">
                المبلغ المتاح: {user?.balance || 0} جنيه
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>طريقة السحب</Form.Label>
              <Form.Select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                required
              >
                <option value="instapay">إنستاباي</option>
                <option value="vodafone">فودافون كاش</option>
                <option value="bank">تحويل بنكي</option>
                <option value="fawry">فوري</option>
              </Form.Select>
              <Form.Text className="text-muted">
                تأكد من إضافة تفاصيل طريقة السحب في صفحة "طرق الدفع"
              </Form.Text>
            </Form.Group>

            <Alert variant="warning" className="mb-0">
              <small>
                <strong>⚠️ تنبيه:</strong> سيتم مراجعة الطلب والتحويل خلال 3-5 أيام عمل. تأكد من صحة تفاصيل طريقة السحب المختارة.
              </small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowWithdrawModal(false)}
              disabled={processing}
            >
              إلغاء
            </Button>
            <Button 
              variant="success" 
              type="submit"
              disabled={processing}
            >
              {processing ? 'جاري المعالجة...' : 'تأكيد السحب'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default TutorEarnings;
