import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const Loader = ({ message = "Loading..." }) => {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center mt-5" style={{ minHeight: '200px' }}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <div className="mt-3 text-muted">{message}</div>
    </Container>
  );
};

export default Loader;
