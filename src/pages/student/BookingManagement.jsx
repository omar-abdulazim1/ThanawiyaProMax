import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Modal, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { bookingAPI } from '../../services/backendApi';

function BookingManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAllBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      toast.error('فشل تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => 
    b.status === 'pending' || b.status === 'confirmed'
  );

  const completedBookings = bookings.filter(b => 
    b.status === 'completed'
  );

  const cancelledBookings = bookings.filter(b => 
    b.status === 'cancelled'
  );

  const oldBookings = {
    upcoming: [
      {
        id: 1,
        tutor: 'محمد أحمد علي',
        subject: 'الرياضيات',
        date: '2025-11-22',
        time: '4:00 م',
        duration: 60,
        price: 172.5,
        status: 'مؤكدة',
        paymentStatus: 'مدفوعة'
      },
      {
        id: 2,
        tutor: 'سارة محمود حسن',
        subject: 'الفيزياء',
        date: '2025-11-23',
        time: '6:00 م',
        duration: 90,
        price: 220,
        status: 'قيد الانتظار',
        paymentStatus: 'قيد الانتظار'
      },
      {
        id: 3,
        tutor: 'أحمد حسن محمد',
        subject: 'الكيمياء',
        date: '2025-11-24',
        time: '5:00 م',
        duration: 60,
        price: 172.5,
        status: 'مؤكدة',
        paymentStatus: 'مدفوعة'
      }
    ],
    completed: [
      {
        id: 4,
        tutor: 'محمد أحمد علي',
        subject: 'الرياضيات',
        date: '2025-11-15',
        time: '4:00 م',
        duration: 60,
        price: 172.5,
        status: 'مكتملة',
        rating: 5
      },
      {
        id: 5,
        tutor: 'فاطمة علي أحمد',
        subject: 'اللغة العربية',
        date: '2025-11-10',
        time: '2:00 م',
        duration: 90,
        price: 220,
        status: 'مكتملة',
        rating: 4
      }
    ],
    cancelled: [
      {
        id: 6,
        tutor: 'عمر محمد سعيد',
        subject: 'الفيزياء',
        date: '2025-11-18',
        time: '3:00 م',
        duration: 60,
        price: 172.5,
        status: 'ملغاة',
        cancelReason: 'ظروف طارئة'
      }
    ]
  };

  const handleCancelBooking = () => {
    alert('تم إلغاء الحجز بنجاح');
    setShowCancelModal(false);
  };

  const handleReschedule = (e) => {
    e.preventDefault();
    alert('تم إرسال طلب إعادة الجدولة');
    setShowRescheduleModal(false);
  };

  const handlePayNow = (booking) => {
    // Calculate hourly rate from total price and duration
    const totalHours = booking.duration / 60;
    const hourlyRate = booking.price / totalHours / 1.05; // Remove platform fee to get base rate
    
    navigate('/checkout', {
      state: {
        tutorName: booking.tutor,
        subject: booking.subject,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        hourlyRate: hourlyRate,
        totalHours: totalHours,
        notes: '',
        bookingId: booking.id // Include booking ID to update status after payment
      }
    });
  };

  const renderBookingCard = (booking) => {
    // Format date and time from backend
    const sessionDate = new Date(booking.sessionDate);
    const formattedDate = sessionDate.toLocaleDateString('ar-EG');
    const formattedTime = sessionDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    // Get tutor name from populated tutorId
    const tutorName = booking.tutorId?.userId?.name || booking.tutorId?.name || 'المدرس';
    
    // Map backend status to Arabic
    const statusMap = {
      'pending': 'قيد الانتظار',
      'confirmed': 'مؤكدة',
      'completed': 'مكتملة',
      'cancelled': 'ملغاة'
    };
    const displayStatus = statusMap[booking.status] || booking.status;
    
    return (
      <Card key={booking._id} className="mb-3 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="fw-bold mb-2">{booking.subject}</h5>
              <p className="text-muted mb-1">
                <small>المدرس: {tutorName}</small>
              </p>
              <p className="text-muted mb-2">
                <small>📅 {formattedDate} • ⏰ {formattedTime}</small>
              </p>
              <p className="mb-2">
                <small>⏱️ المدة: {booking.duration} دقيقة</small>
              </p>
              <Badge bg={
                booking.status === 'confirmed' ? 'success' :
                booking.status === 'pending' ? 'warning' :
                booking.status === 'completed' ? 'info' : 'danger'
              }>
                {displayStatus}
              </Badge>
            </Col>
            <Col md={3} className="text-center">
              <div className="fw-bold text-primary fs-4">{booking.totalPrice} جنيه</div>
              {booking.rating && (
                <div className="mt-2">
                  <Badge bg="warning" text="dark">⭐ {booking.rating}</Badge>
                </div>
              )}
            </Col>
            <Col md={3}>
              <div className="d-grid gap-2">
                {booking.status === 'confirmed' && (
                  <>
                    <Button variant="primary" size="sm">
                      🎥 انضم للجلسة
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRescheduleModal(true);
                      }}
                    >
                      إعادة جدولة
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                    >
                      إلغاء
                    </Button>
                  </>
                )}
                {booking.status === 'pending' && (
                  <>
                    <Button variant="outline-primary" size="sm">
                      في انتظار التأكيد
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                    >
                      إلغاء
                    </Button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <>
                    <Button variant="outline-primary" size="sm">
                      عرض التفاصيل
                    </Button>
                    <Button variant="outline-success" size="sm">
                      احجز مرة أخرى
                    </Button>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">إدارة الحجوزات</h2>
          <p className="text-muted">تتبع وإدارة جميع حجوزاتك</p>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body>
              <h6>الحجوزات القادمة</h6>
              <h2 className="fw-bold">{upcomingBookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-success text-white">
            <Card.Body>
              <h6>الجلسات المكتملة</h6>
              <h2 className="fw-bold">{completedBookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-info text-white">
            <Card.Body>
              <h6>إجمالي الجلسات</h6>
              <h2 className="fw-bold">
                {bookings.length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bookings Tabs */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
            <Tab eventKey="upcoming" title={`القادمة (${upcomingBookings.length})`}>
              <div className="py-3">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => renderBookingCard(booking))
                ) : (
                  <div className="text-center py-5">
                    <div className="display-4 mb-3">📅</div>
                    <h5>لا توجد حجوزات قادمة</h5>
                    <Button 
                      as={Link}
                      to="/student/find-tutors"
                      variant="primary" 
                      className="mt-3"
                    >
                      ابحث عن مدرس
                    </Button>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="completed" title={`المكتملة (${completedBookings.length})`}>
              <div className="py-3">
                {completedBookings.length > 0 ? (
                  completedBookings.map(booking => renderBookingCard(booking))
                ) : (
                  <div className="text-center py-5">
                    <div className="display-4 mb-3">✓</div>
                    <h5>لا توجد جلسات مكتملة</h5>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="cancelled" title={`الملغاة (${cancelledBookings.length})`}>
              <div className="py-3">
                {cancelledBookings.length > 0 ? (
                  cancelledBookings.map(booking => renderBookingCard(booking))
                ) : (
                  <div className="text-center py-5">
                    <div className="display-4 mb-3">📭</div>
                    <h5>لا توجد حجوزات ملغاة</h5>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>إلغاء الحجز</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>هل أنت متأكد من إلغاء هذا الحجز؟</p>
          <p className="text-muted small">
            ⚠️ قد يتم فرض رسوم إلغاء حسب سياسة الإلغاء
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            رجوع
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            تأكيد الإلغاء
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reschedule Modal */}
      <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>إعادة جدولة الحجز</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReschedule}>
            <Form.Group className="mb-3">
              <Form.Label>التاريخ الجديد</Form.Label>
              <Form.Control type="date" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الوقت الجديد</Form.Label>
              <Form.Select required>
                <option value="">اختر الوقت</option>
                <option>8:00 ص</option>
                <option>10:00 ص</option>
                <option>2:00 م</option>
                <option>4:00 م</option>
                <option>6:00 م</option>
                <option>8:00 م</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>سبب إعادة الجدولة (اختياري)</Form.Label>
              <Form.Control as="textarea" rows={2} />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button type="submit" variant="primary">
                إرسال الطلب
              </Button>
              <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
                إلغاء
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default BookingManagement;
