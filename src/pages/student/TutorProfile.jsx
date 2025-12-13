import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Form, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { tutorAPI, userAPI, getCurrentUserData } from '../../services/backendApi';

function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: '60',
    subject: '',
    notes: ''
  });
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUser = getCurrentUserData();

  // Load tutor data from backend
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const response = await tutorAPI.getTutorById(id);
        if (response.success && response.data) {
          // Ensure userId is populated
          if (!response.data.userId || !response.data.userId.name) {
            toast.error('بيانات المدرس غير مكتملة');
            setLoading(false);
            return;
          }
          
          setTutor(response.data);
          
          // Check if tutor is in favorites
          if (currentUser && currentUser.favoritesTutors && response.data.userId._id) {
            setIsFavorite(currentUser.favoritesTutors.includes(response.data.userId._id));
          }
        } else {
          toast.error('فشل تحميل بيانات المدرس');
        }
      } catch (error) {
        console.error('Error loading tutor:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutor();
  }, [id]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!currentUser || currentUser.role !== 'student') {
      toast.error('يجب تسجيل الدخول كطالب لإضافة المدرسين للمفضلة');
      return;
    }

    if (!tutor || !tutor.userId || !tutor.userId._id) {
      toast.error('بيانات المدرس غير متوفرة');
      return;
    }

    try {
      const tutorUserId = tutor.userId._id;
      
      if (isFavorite) {
        // Remove from favorites
        await userAPI.removeFavorite(currentUser._id, tutorUserId);
        setIsFavorite(false);
        toast.success('تم إزالة المدرس من المفضلة');
      } else {
        // Add to favorites
        await userAPI.addFavorite(currentUser._id, tutorUserId);
        setIsFavorite(true);
        toast.success('تم إضافة المدرس للمفضلة');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('فشل تحديث المفضلة');
    }
  };

  const handleBooking = (e) => {
    e.preventDefault();
    
    if (!tutor || !tutor.userId || !tutor.userId._id) {
      toast.error('بيانات المدرس غير متوفرة');
      return;
    }
    
    // Get hourly rate and calculate total hours
    const hourlyRate = tutor.hourlyRate || 0;
    const totalHours = parseInt(bookingData.duration) / 60;
    
    // Navigate to checkout with booking data
    // Backend expects userId (the User document ID), not the Tutor document ID
    navigate('/checkout', {
      state: {
        tutorId: tutor.userId._id, // User ID (backend looks for Tutor.findOne({ userId: tutorId }))
        tutorName: tutor.userId.name || 'مدرس',
        subject: bookingData.subject,
        date: bookingData.date,
        time: bookingData.time,
        duration: `${bookingData.duration} دقيقة`,
        hourlyRate: hourlyRate,
        totalHours: totalHours,
        notes: bookingData.notes
      }
    });
    
    setShowBookingModal(false);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">جاري تحميل بيانات المدرس...</p>
      </Container>
    );
  }

  if (!tutor) {
    return (
      <Container className="py-5 text-center">
        <div className="display-1 mb-3">😕</div>
        <h3>لم يتم العثور على المدرس</h3>
        <Button as={Link} to="/student/find-tutors" variant="primary" className="mt-3">
          العودة لقائمة المدرسين
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="g-4">
        {/* Profile Header */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <div className="display-1 me-4">👨‍🏫</div>
                <div className="flex-grow-1">
                  <h2 className="fw-bold mb-2">{tutor.userId?.name || 'مدرس'}</h2>
                  <p className="text-muted mb-3">
                    {tutor.university || 'جامعة'} - {tutor.major || 'تخصص'}
                  </p>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <div>
                      <span className="badge bg-warning text-dark fs-6">
                        ⭐ {tutor.rating || 0}
                      </span>
                    </div>
                    <div className="text-muted">
                      📚 {tutor.completedSessions || 0} جلسة
                    </div>
                    <div className="text-muted">
                      💰 {tutor.hourlyRate || 0} جنيه/ساعة
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {tutor.teachingSubjects && tutor.teachingSubjects.length > 0 ? (
                      tutor.teachingSubjects.map((subject, idx) => (
                        <Badge key={idx} bg="primary" className="fs-6">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <Badge bg="secondary" className="fs-6">لا توجد مواد محددة</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Tabs */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs defaultActiveKey="about" className="mb-3">
                <Tab eventKey="about" title="نبذة">
                  <div className="py-3">
                    <h5 className="fw-bold mb-3">نبذة عن المدرس</h5>
                    <p className="text-muted">{tutor.tutorBio || 'لا توجد نبذة متاحة'}</p>
                    {tutor.userId.bio && (
                      <>
                        <h5 className="fw-bold mb-3 mt-4">معلومات إضافية</h5>
                        <p className="text-muted">{tutor.userId.bio}</p>
                      </>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="subjects" title="المواد والأسعار">
                  <div className="py-3">
                    <h5 className="fw-bold mb-3">المواد المتاحة</h5>
                    <Row className="g-3">
                      {tutor.teachingSubjects && tutor.teachingSubjects.map((subject, idx) => (
                        <Col md={6} key={idx}>
                          <Card className="border">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">{subject}</h6>
                                <span className="text-primary fw-bold">
                                  {tutor.hourlyRate} جنيه/ساعة
                                </span>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab>

                <Tab eventKey="availability" title="الأوقات المتاحة">
                  <div className="py-3">
                    <h5 className="fw-bold mb-3">الأوقات المتاحة</h5>
                    {tutor.availability && tutor.availability.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {tutor.availability.map((time, idx) => (
                          <Badge key={idx} bg="success" className="fs-6 px-3 py-2">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">لا توجد أوقات محددة، يرجى التواصل مع المدرس</p>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="reviews" title={`التقييمات (${tutor.totalRatings || 0})`}>
                  <div className="py-3">
                    <h5 className="fw-bold mb-3">آراء الطلاب</h5>
                    {tutor.totalRatings > 0 ? (
                      <div className="text-center py-4">
                        <div className="display-3 mb-3">⭐</div>
                        <h4 className="fw-bold">{tutor.rating}</h4>
                        <p className="text-muted">بناءً على {tutor.totalRatings} تقييم</p>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="display-4 mb-3">📝</div>
                        <p className="text-muted">لا توجد تقييمات بعد</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">احجز جلسة</h5>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setShowBookingModal(true)}
                >
                  📅 احجز الآن
                </Button>
                <Button 
                  as={Link}
                  to={`/student/chat/${tutor._id}`}
                  variant="outline-primary"
                >
                  💬 راسل المدرس
                </Button>
                <Button 
                  variant={isFavorite ? 'danger' : 'outline-danger'}
                  onClick={toggleFavorite}
                >
                  {isFavorite ? '❤️ إزالة من المفضلة' : '🤍 أضف للمفضلة'}
                </Button>
              </div>

              <hr />

              <div className="text-center">
                <p className="text-muted small mb-2">وقت الاستجابة المتوقع</p>
                <p className="fw-bold">أقل من 30 دقيقة</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>حجز جلسة مع {tutor.userId?.name || 'المدرس'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBooking}>
            <Form.Group className="mb-3">
              <Form.Label>المادة</Form.Label>
              <Form.Select 
                required
                onChange={(e) => setBookingData({...bookingData, subject: e.target.value})}
              >
                <option value="">اختر المادة</option>
                {tutor.teachingSubjects && tutor.teachingSubjects.length > 0 ? (
                  tutor.teachingSubjects.map((subject, idx) => (
                    <option key={idx} value={subject}>
                      {subject} - {tutor.hourlyRate || 0} جنيه/ساعة
                    </option>
                  ))
                ) : (
                  <>
                    <option value="الرياضيات">الرياضيات - {tutor.hourlyRate || 0} جنيه/ساعة</option>
                    <option value="العلوم">العلوم - {tutor.hourlyRate || 0} جنيه/ساعة</option>
                    <option value="الفيزياء">الفيزياء - {tutor.hourlyRate || 0} جنيه/ساعة</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>التاريخ</Form.Label>
                  <Form.Control 
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الوقت</Form.Label>
                  <Form.Select 
                    required
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  >
                    <option value="">اختر الوقت</option>
                    {tutor.availability && tutor.availability.length > 0 ? (
                      tutor.availability.map((time, idx) => (
                        <option key={idx} value={time}>{time}</option>
                      ))
                    ) : (
                      <>
                        <option value="09:00">09:00 صباحاً</option>
                        <option value="10:00">10:00 صباحاً</option>
                        <option value="11:00">11:00 صباحاً</option>
                        <option value="12:00">12:00 ظهراً</option>
                        <option value="14:00">02:00 مساءً</option>
                        <option value="15:00">03:00 مساءً</option>
                        <option value="16:00">04:00 مساءً</option>
                        <option value="17:00">05:00 مساءً</option>
                        <option value="18:00">06:00 مساءً</option>
                        <option value="19:00">07:00 مساءً</option>
                        <option value="20:00">08:00 مساءً</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>مدة الجلسة</Form.Label>
              <Form.Select 
                value={bookingData.duration}
                onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
              >
                <option value="60">60 دقيقة</option>
                <option value="90">90 دقيقة</option>
                <option value="120">120 دقيقة</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ملاحظات (اختياري)</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                placeholder="أضف أي ملاحظات أو متطلبات خاصة..."
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
              />
            </Form.Group>

            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>السعر الأساسي:</span>
                <span className="fw-bold">150 جنيه</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>رسوم المنصة (15%):</span>
                <span className="fw-bold">22.5 جنيه</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">الإجمالي:</span>
                <span className="fw-bold text-primary fs-5">172.5 جنيه</span>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-100">
              تأكيد الحجز
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TutorProfile;
