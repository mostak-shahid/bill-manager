import { useLocation } from 'react-router-dom';
/**
 * Recursive page finder
 */
const findPageInfo = (menuArray, path) => {
    for (const item of menuArray) {

        if (item.url === path) {
            return {
                title: item.text,
                description: item.description,
            };
        }

        if (item.items && Array.isArray(item.items)) {
            const found = findPageInfo(item.items, path);
            if (found) return found;
        }
    }

    return null;
};

/**
 * Page Info Component
 */
const PageInfo = ({ menu=[], url }) => {

    const pageInfo = findPageInfo(menu, url);

    if (!pageInfo) return null;

    return (
        <div className="page-info">
            <h3 className="page-title h3">
                {pageInfo.title}
            </h3>

            {pageInfo.description && (
                <div className="page-description">
                {pageInfo.description}
                </div>
            )}
        </div>
    );
};

export default PageInfo;
