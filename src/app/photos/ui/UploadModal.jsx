import { Modal, Form, Button } from 'react-bootstrap';

export default function UploadModal({
    showUploadModal,
    handleClose,
    setUploadFile,
    setUploadTags,
    isUploading,
    uploadTags,
    handleUpload
}) {



    return (
        <Modal show={showUploadModal} onHide={handleClose} animation={true}>
            <Modal.Header closeButton>
                <Modal.Title as="h5">Upload Photo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUploadFile(e.target.files)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Tags (comma separated)"
                        value={uploadTags}
                        onChange={(e) => setUploadTags(e.target.value)}
                    />
                </Form.Group>

                <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleUpload}
                    disabled={isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Start Upload'}
                </Button>
            </Modal.Body>
        </Modal>

    );

}