import { Modal, Form, Button } from 'react-bootstrap';

export default function SettingsModal({
    showSettingsModal,
    handleClose,
    setNewTags,
    handleUpdateTags,
    isUpdating,
    isDeleting,
    handleDeleteImage,
    newTags
}) {
    
    return (
        <Modal show={showSettingsModal} onHide={handleClose} animation={true}>
            <Modal.Header closeButton>
                <Modal.Title as="h5">Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    type="text"
                    className="mb-3"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                />

                <Button
                    variant="primary"
                    className="w-100 mb-2"
                    onClick={() => handleUpdateTags()}
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Updating..' : 'Update Tags'}
                </Button>

                <Button
                    variant="danger"
                    className="w-100"
                    disabled={isDeleting || isUpdating}
                    onClick={() => handleDeleteImage()}
                >
                    {isDeleting ? 'Deleting..' : 'Delete Image'}
                </Button>
            </Modal.Body>
        </Modal>

    );

}