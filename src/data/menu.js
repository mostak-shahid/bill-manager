import menuData from './menu.json';

function injectMenu(menu, item) {
    // Create deep copy of menu to avoid mutation
    const menuCopy = JSON.parse(JSON.stringify(menu));
    
    // 1. Insert before specific itemKey
    if (item.insertBefore) {
        const index = menuCopy.findIndex(m => m.itemKey === item.insertBefore);
        if (index >= 0) {
            menuCopy.splice(index, 0, cleanItem(item));
            return menuCopy;
        }
    }

    // 2. Insert after specific itemKey
    if (item.insertAfter) {
        const index = menuCopy.findIndex(m => m.itemKey === item.insertAfter);
        if (index >= 0) {
            menuCopy.splice(index + 1, 0, cleanItem(item));
            return menuCopy;
        }
    }

    // 3. Insert as a submenu under a free menu item
    if (item.parentKey) {
        const parent = menuCopy.find(m => m.itemKey === item.parentKey);
        if (parent) {
            parent.items = parent.items || [];
            parent.items.push(cleanItem(item));
            return menuCopy;
        }
    }

    // 4. Insert at a defined index
    if (typeof item.position === "number") {
        menuCopy.splice(item.position, 0, cleanItem(item));
        return menuCopy;
    }

    // 5. Default = append to root level
    return [...menuCopy, cleanItem(item)];
}

function cleanItem(item) {
    const copy = { ...item };
    delete copy.insertBefore;
    delete copy.insertAfter;
    delete copy.parentKey;
    delete copy.position;
    return copy;
}

export function getMenu({ baseMenu = menuData, proItems = [], remoteItems = [] }) {        
    // Create deep copy of base menu to avoid mutation
    let menu = JSON.parse(JSON.stringify(baseMenu));

    // Add flat pro items (default: append)
    if (proItems.length) {
        proItems.forEach(item => {
            menu = injectMenu(menu, item);
        });
    }

    // Optional remote dynamic items
    if (remoteItems.length) {
        remoteItems.forEach(item => {
            menu = injectMenu(menu, item);
        });
    }

    return menu;
}