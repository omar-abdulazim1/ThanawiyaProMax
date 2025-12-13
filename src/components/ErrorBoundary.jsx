import { Component } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <Card className="shadow-sm border-danger border-2">
            <Card.Body className="text-center p-5">
              <div className="mb-4">
                <span className="display-1">⚠️</span>
              </div>
              <h1 className="h3 mb-3 text-danger">عذراً، حدث خطأ غير متوقع</h1>
              <p className="text-muted mb-4">
                نعتذر عن الإزعاج. حدث خطأ أثناء تحميل هذه الصفحة.
              </p>
              {import.meta.env.MODE === 'development' && this.state.error && (
                <Card className="text-start mb-4 bg-light">
                  <Card.Body>
                    <h6 className="text-danger mb-2">تفاصيل الخطأ (Development Only):</h6>
                    <pre className="mb-0 small text-wrap">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </Card.Body>
                </Card>
              )}
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="primary" onClick={this.handleReset}>
                  العودة للصفحة الرئيسية
                </Button>
                <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                  إعادة تحميل الصفحة
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
