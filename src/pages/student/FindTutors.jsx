import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { tutorAPI, userAPI, getCurrentUserData } from '../../services/backendApi';

function FindTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    availability: ''
  });
  const [favorites, setFavorites] = useState([]);
  const currentUser = getCurrentUserData();

  // Load tutors and favorites from API
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await tutorAPI.getAllTutors({
          subjects: filters.subject,
          minRate: filters.minPrice,
          maxRate: filters.maxPrice,
          minRating: filters.rating
        });
        if (response.success) {
          setTutors(response.data);
          if (currentUser && currentUser.favoritesTutors) {
            setFavorites(currentUser.favoritesTutors);
          }
        }
      } catch (error) {
        toast.error('فشل تحميل المدرسين');
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [filters.subject, filters.minPrice, filters.maxPrice, filters.rating]);

  // Toggle favorite
  const toggleFavorite = async (tutorUserId) => {
    if (!currentUser || currentUser.role !== 'student') {
      toast.error('يجب تسجيل الدخول كطالب لإضافة المدرسين للمفضلة');
      return;
    }

    try {
      if (favorites.includes(tutorUserId)) {
        // Remove from favorites
        await userAPI.removeFavorite(currentUser._id, tutorUserId);
        setFavorites(favorites.filter(id => id !== tutorUserId));
        toast.success('تم إزالة المدرس من المفضلة');
      } else {
        // Add to favorites
        await userAPI.addFavorite(currentUser._id, tutorUserId);
        setFavorites([...favorites, tutorUserId]);
        toast.success('تم إضافة المدرس للمفضلة');
      }
    } catch (error) {
      toast.error('فشل تحديث المفضلة');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">جاري تحميل المدرسين...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <section aria-labelledby="find-tutors-title">
        <Row className="mb-4">
          <Col>
            <h1 id="find-tutors-title" className="fw-bold">ابحث عن مدرسك الجامعي المثالي</h1>
            <p className="text-muted">استعرض {tutors.length} مدرس متاح للتدريس</p>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Filters Sidebar */}
          <Col lg={3}>
            <Card className="shadow-sm border-0 sticky-top" style={{ top: '100px' }}>
              <Card.Header className="bg-white border-bottom">
                <h2 className="h5 mb-0 fw-bold">الفلترة</h2>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="subject-filter" className="fw-bold">المادة</Form.Label>
                    <Form.Select 
                      id="subject-filter"
                      name="subject" 
                      onChange={handleFilterChange}
                      aria-label="اختر المادة للبحث"
                    >
                      <option value="">جميع المواد</option>
                      <option value="الرياضيات">الرياضيات</option>
                      <option value="الفيزياء">الفيزياء</option>
                      <option value="الكيمياء">الكيمياء</option>
                      <option value="الأحياء">الأحياء</option>
                      <option value="اللغة العربية">اللغة العربية</option>
                      <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">السعر (جنيه/ساعة)</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          id="min-price"
                          type="number"
                          placeholder="من"
                          name="minPrice"
                          onChange={handleFilterChange}
                          aria-label="الحد الأدنى للسعر"
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          id="max-price"
                          type="number"
                          placeholder="إلى"
                          name="maxPrice"
                          onChange={handleFilterChange}
                          aria-label="الحد الأقصى للسعر"
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="rating-filter" className="fw-bold">التقييم الأدنى</Form.Label>
                    <Form.Select 
                      id="rating-filter"
                      name="rating" 
                      onChange={handleFilterChange}
                      aria-label="اختر التقييم الأدنى"
                    >
                      <option value="">الكل</option>
                      <option value="4.5">4.5+ ⭐</option>
                      <option value="4.0">4.0+ ⭐</option>
                      <option value="3.5">3.5+ ⭐</option>
                    </Form.Select>
                  </Form.Group>

                  <Button 
                    variant="outline-secondary" 
                    className="w-100" 
                    onClick={() => setFilters({
                      subject: '', minPrice: '', maxPrice: '', rating: '', availability: ''
                    })}
                    aria-label="إعادة تعيين جميع الفلاتر"
                  >
                    إعادة تعيين
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Tutors Grid */}
          <Col lg={9}>
            <div role="status" className="visually-hidden" aria-live="polite">
              تم العثور على {tutors.length} مدرس
            </div>
            <Row className="g-4">
              {tutors.map(tutor => (
                <Col md={6} key={tutor._id}>
                  <article className="h-100">
                    <Card className="h-100 shadow-sm border-0 hover-shadow">
                      <Card.Body>
                        <div className="d-flex align-items-start mb-3">
                          <div className="fs-1 me-3" aria-hidden="true">👨‍🏫</div>
                          <div className="flex-grow-1">
                            <h3 className="h5 fw-bold mb-1">{tutor.userId?.name || 'المدرس'}</h3>
                            <p className="text-muted small mb-2">{tutor.university}</p>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="badge bg-warning text-dark" aria-label={`التقييم ${tutor.rating} من 5`}>
                                <span aria-hidden="true">⭐</span> {tutor.rating || 0}
                              </span>
                              <span className="text-muted small">
                                ({tutor.completedSessions || 0} جلسة)
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="link" 
                            className={`p-0 ${favorites.includes(tutor.userId?._id) ? 'text-danger' : 'text-muted'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(tutor.userId?._id);
                            }}
                            aria-label={`${favorites.includes(tutor.userId?._id) ? 'إزالة' : 'إضافة'} ${tutor.userId?.name} ${favorites.includes(tutor.userId?._id) ? 'من' : 'إلى'} المفضلة`}
                            style={{ fontSize: '1.5rem' }}
                          >
                            <span aria-hidden="true">{favorites.includes(tutor.userId?._id) ? '❤️' : '🤍'}</span>
                          </Button>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex flex-wrap gap-1 mb-2" role="list" aria-label="المواد التي يدرسها">
                            {tutor.teachingSubjects?.map((subject, idx) => (
                              <Badge key={idx} bg="light" text="dark" className="border" role="listitem">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-primary fs-5" aria-label={`السعر ${tutor.hourlyRate} جنيه للساعة`}>
                              {tutor.hourlyRate} جنيه/ساعة
                            </span>
                            <span className="badge bg-success">
                              متاح
                            </span>
                          </div>
                        </div>

                        <div className="d-grid gap-2">
                          <Button 
                            as={Link} 
                            to={`/student/tutor/${tutor._id}`} 
                            variant="primary"
                            aria-label={`عرض الملف الشخصي لـ ${tutor.userId?.name}`}
                          >
                            عرض الملف الشخصي
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </article>
                </Col>
              ))}
            </Row>

            {tutors.length === 0 && (
              <Card className="text-center py-5">
                <Card.Body role="status">
                  <div className="display-1 mb-3" aria-hidden="true">🔍</div>
                  <h2 className="h4">لم يتم العثور على نتائج</h2>
                  <p className="text-muted">جرب تغيير معايير البحث</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </section>
    </Container>
  );
}

export default FindTutors;
