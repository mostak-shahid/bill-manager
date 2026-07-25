import { __ } from "@wordpress/i18n";
import {Card} from 'react-bootstrap';
import { Layout } from './layouts';
import {Illustration404} from './lib/Illustrations';
const NotFound = () => {
    return (        
        <Layout sidebarPosition="none" fluid={true}>     
            <div className="text-center h-100 d-flex align-items-center justify-content-center border rounded-3 p-3">
                <div className="404-error-wrapper">
                    <Illustration404 width="300" height="300"/>
                    <h3 className="h3 mt-2">{ __( 'Page Not Found', 'bill-manager' ) }</h3>
                    <p>
                    { __( 'The page you are looking for does not exist.', 'bill-manager' ) }
                    </p>
                </div>
            </div>
        </Layout>
    );
};
export default NotFound;