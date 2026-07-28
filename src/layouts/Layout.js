import {useSettingsBodyHeight} from '../lib/Helpers';
import {Container} from 'react-bootstrap';
import './Layout.css'
const Layout = ({ children, sidebar, sidebarPosition='none', fluid=false, className='' }) => {
    const minHeight = useSettingsBodyHeight();
    return (
        <Container className={`plugin-starter-layout ${className} ${fluid ? 'fluid-layout p-0' : 'boxed-layout'}`} fluid={fluid}>
            <div 
                className="d-flex align-items-stretch"
                style={{ minHeight: minHeight ? `${minHeight}px` : 'auto' }}
            >
                {sidebarPosition === 'left' &&
                    <div className="sidebar sidebar-left border-end">
                        {sidebar}
                    </div>            
                }
                <div className="main-content p-4">
                    {children}
                </div>
                {sidebarPosition === 'right' &&
                    <div className="sidebar sidebar-right border-start">
                        {sidebar}
                    </div>            
                }
            </div>
        </Container>
    );
};

export default Layout;