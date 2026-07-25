import { useState, useEffect } from '@wordpress/element';
import DataTable from 'react-data-table-component';
import {useWindowWidth} from '../../../lib/Helpers';
import './ResponsiveTable.css'; // Import the CSS file containing media queries

// 1. Setup sample data
const data = [
    { id: 1, name: 'John Doe', role: 'Software Engineer', email: 'john@example.com', phone: '+1-555-0199', city: 'New York' },
    { id: 2, name: 'Jane Smith', role: 'UI/UX Designer', email: 'jane@example.com', phone: '+1-555-0143', city: 'San Francisco' },
    { id: 3, name: 'Alex Jones', role: 'Product Manager', email: 'alex@example.com', phone: '+1-555-0177', city: 'Austin' },
];

// 2. Define the Expanded Component to show hidden column data on mobile
const ExpandedComponent = ({ data }) => (
    <div className="expanded-row-container">
        <p className="show-on-lg"><strong>Role:</strong> {data.role}</p>
        <p className="show-on-md"><strong>Email:</strong> {data.email}</p>
        <p className="show-on-sm"><strong>Phone:</strong> {data.phone}</p>
    </div>
);

// 3. Define columns using hideAsymmetric/custom classes
const columns = [
    {
        name: 'Name',
        selector: row => row.name,
        sortable: true,
        pinned: 'left'
    },
    {
        name: 'Role',
        selector: row => row.role,
        sortable: true,
        hide: 'lg',
    },
    {
        name: 'Email',
        selector: row => row.email,
        hide: 'md', // Native wrapper break-point hide flag (sm, md, lg)
    },
    {
        name: 'Phone',
        selector: row => row.phone,
        hide: 'sm',
    },
    {
        name: 'City',
        selector: row => row.city,
        pinned: 'right'
    },
];
export default function ResponsiveTable() {

    const width = useWindowWidth();
    const hasHiddenColumns = width <= 1279; 
    return (
        <div className="table-wrapper responsive-table-wrapper">
        lorem10
            <DataTable
                title="Responsive Employee Directory"
                columns={columns}
                data={data}
                pagination
                // expandableRows
                // expandableRowsComponent={ExpandedComponent}

                expandableRows={hasHiddenColumns} // Turns off the expander logic entirely if on desktop
                expandableRowDisabled={row => !hasHiddenColumns} // Hides the ">" arrow icon dynamically per row
                expandableRowsComponent={ExpandedComponent}
                responsive
            />
        </div>
    );
}
