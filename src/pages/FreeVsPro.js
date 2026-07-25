import {Table} from 'react-bootstrap';

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Layout } from '../layouts';
import {HorizontalMultiLevelNavbar, VerticalMultiLevelNavbar} from '../components/Menu/Menu';
import BreadcrumbControl from '../components/BreadcrumbControl/BreadcrumbControl';
import { PageInfo } from '../components';
const menuItems = [
    
    {
        "itemKey": "free-vs-pro",
        "text": "Free vs Pro",
        "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        "url": "/free-vs-pro"
    }
];
const FreeVsPro = () => {
    return (        
        <Layout sidebarPosition="none">  
            <BreadcrumbControl menu={menuItems} url="/free-vs-pro"  className='mb-3 border rounded-0 py-2 px-3' />
            <div className='mb-3 border rounded-0 p-3'>
                <PageInfo menu={menuItems} url="/free-vs-pro"  />
            </div>   
            <Table responsive bordered hover>
                <thead>
                    <tr>
                        <th>Features</th>
                        <th>Free</th>
                        <th>Pro</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Semi Design design draft.fig</td>
                        <td><FaTimesCircle /></td>
                        <td><FaCheckCircle /></td>
                    </tr>
                    <tr>
                        <td>Semi Design design draft.fig</td>
                        <td><FaTimesCircle /></td>
                        <td><FaCheckCircle /></td>
                    </tr>
                    <tr>
                        <td>Semi Design design draft.fig</td>
                        <td><FaTimesCircle /></td>
                        <td><FaCheckCircle /></td>
                    </tr>
                </tbody>
            </Table>
        </Layout>
    );
};
export default FreeVsPro;