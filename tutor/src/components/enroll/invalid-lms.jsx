import React from 'react';
import { Modal, Alert } from 'react-bootstrap';

export default function invalidCode({ enrollment }) {
  return (
    <Modal.Body>
      <Alert bsStyle="danger">
        The provided enrollment code is not valid. Please verify the enrollment code and try again.
      </Alert>
    </Modal.Body>
  );
}
