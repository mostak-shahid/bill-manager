import { __ } from "@wordpress/i18n";
import { useMemo } from '@wordpress/element';
import { Card, Breadcrumb } from 'react-bootstrap';
const pathPrefix = 'admin.php?page=bill-manager#'; // Adjust this if your app is served from a different base path
const generateBreadcrumbs = (pathname, menuData) => {
    const breadcrumbs = [
        { name: __("Home", "bill-manager"), href: '/', path: '/' }
    ];

    const findInMenu = (items, path, parentCrumbs = []) => {
        for (const item of items) {
            if (!item.url || item.url === '#' || item.url.startsWith('http')) continue;
            if (path === item.url || path.startsWith(item.url + '/')) {
                const currentCrumbs = [...parentCrumbs, { name: item.text, path: item.url, href: item.url }];
                if (path === item.url) return currentCrumbs;
                if (item.items && item.items.length > 0) {
                    const subResult = findInMenu(item.items, path, currentCrumbs);
                    if (subResult) return subResult;
                }
                return currentCrumbs;
            }
            if (item.items && item.items.length > 0) {
                const subResult = findInMenu(item.items, path, [...parentCrumbs, { name: item.text, path: item.url, href: item.url }]);
                if (subResult) return subResult;
            }
        }
        return null;
    };

    const foundCrumbs = findInMenu(menuData, pathname);
    if (foundCrumbs && foundCrumbs.length > 0) {
        breadcrumbs.push(...foundCrumbs);
    }
    return breadcrumbs;
};

const BreadcrumbControl = ({ menu=[], url='', className='', style = {} }) => {
    const breadcrumbItems = useMemo(() => {
        if (!menu || menu.length === 0) return [];
        return generateBreadcrumbs(url, menu);
    }, [url, menu]);

    if (breadcrumbItems.length === 0) return null;

    return (
        <div className={className} style={style}>
            {/* {console.log('Generated menu:', menu)} */}
            {/* {console.log('Generated url:', url)} */}
            {/* {console.log('Generated breadcrumbs:', breadcrumbItems)} */}
            <Breadcrumb>
                {breadcrumbItems.map((item, index) => (
                    <Breadcrumb.Item 
                        key={index} 
                        href={pathPrefix + item.href}
                        active={index === breadcrumbItems.length - 1}
                    >
                        {item.name}
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </div>
    );
};

export default BreadcrumbControl;

/*
uses
const menuData = [{"itemKey":"inputs","text":"Inputs","url":"/settings/inputs/","items":[{"itemKey":"basic-inputs","text":"Basic Inputs","description":"Basic input settings","url":"/settings/inputs/basic-inputs"},{"itemKey":"array-inputs","text":"Array Inputs","description":"Array input settings","url":"/settings/inputs/array-inputs"},{"itemKey":"complex-inputs","text":"Complex Inputs","description":"Complex input settings","url":"/settings/inputs/complex-inputs"}]},{"itemKey":"utilities","text":"Utilities","url":"/settings/utilities/","items":[{"itemKey":"import-export","text":"Import & Export","description":"Easily import or export plugin settings for backup, migration, or reuse.","url":"/settings/utilities/import-export"},{"itemKey":"tools","text":"Tools","description":"Access helpful utilities for maintenance, debugging, and optimization.","url":"/settings/utilities/tools"},{"itemKey":"logs","text":"Logs","description":"Review and manage plugin activity logs.","url":"/settings/utilities/logs","items":[{"itemKey":"table","text":"Table","description":"Browse detailed logs in a searchable table view.","url":"/settings/utilities/logs/table"},{"itemKey":"analytics","text":"Analytics","description":"Analyze log data with charts and usage insights.","url":"/settings/utilities/logs/analytics"}]}]},{"itemKey":"feedback","text":"Feedback","description":"Share feedback, report issues, or suggest improvements.","url":"/feedback"}];

const url = '/settings/inputs/basic-inputs';
<BreadcrumbControl menu={menuData} url={location.pathname} />
*/