import {Card, Button} from 'react-bootstrap';
import { Layout } from '../../layouts';
import {HorizontalMultiLevelNavbar, VerticalMultiLevelNavbar} from '../../components/Menu/Menu';
const BoxedNoSidebar = () => {
    return (
        <Layout>     
            <Card>
                <Card.Header>Featured</Card.Header>
                <Card.Body>
                    <Card.Title>Special title treatment</Card.Title>
                    <Card.Text>
                    With supporting text below as a natural lead-in to additional content.
                    </Card.Text>
                    <Button variant="primary">Go somewhere</Button>
                </Card.Body>
            </Card>
        </Layout>
    );
};

export default BoxedNoSidebar;