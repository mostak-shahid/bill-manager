import {useSettingsBodyHeight} from '../lib/Helpers';
import {Container} from 'react-bootstrap';
const Layout = ({ children, sidebar, sidebarPosition='none', fluid=false, className='' }) => {
    const minHeight = useSettingsBodyHeight();
    return (
        <Container className={`boxed-layout ${className} ${fluid ? 'p-0' : ''}`} fluid={fluid}>
            <div 
                className="d-flex align-items-stretch"
                style={{ minHeight: minHeight ? `${minHeight}px` : 'auto' }}
            >
                {sidebarPosition === 'left' &&
                    <div 
                        className="sidebar-left border-end" 
                        // style={{ width: 250, height: '100%' }}
                        style={{width: '100%', maxWidth: 250 }}
                    >
                        {sidebar}
                    </div>            
                }
                <div className="p-4 w-100">
                    {children}
                </div>
                {sidebarPosition === 'right' &&
                    <div 
                        className="sidebar-right border-start" 
                        // style={{ width: 250, height: '100%' }}
                        style={{width: '100%', maxWidth: 250 }}
                    >
                        {sidebar}
                    </div>            
                }
            </div>
        </Container>
    );
};

export default Layout;