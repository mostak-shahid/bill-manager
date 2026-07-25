import { useEffect, useState, forwardRef, useImperativeHandle } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    Card,
    Row,
    Col,
} from 'react-bootstrap';
import { VChart } from '@visactor/react-vchart';
import { registerTheme } from '@visactor/vchart';

const LogsCharts = forwardRef((props, ref) => {
    const [chartsLoading, setChartsLoading] = useState(true);
    const [chartsData, setChartsData] = useState({
        overTime: [],
        byCategory: [],
        topUsers: [],
        topIps: [],
        hourlyActivity: [],
    });

    const fetchChartsData = async () => {
        setChartsLoading(true);
        try {
            const [overTime, byCategory, topUsers, topIps, hourlyActivity] = await Promise.all([
                apiFetch({ path: '/bill-manager/v1/logs/stats/over-time' }),
                apiFetch({ path: '/bill-manager/v1/logs/stats/by-category' }),
                apiFetch({ path: '/bill-manager/v1/logs/stats/top-users' }),
                apiFetch({ path: '/bill-manager/v1/logs/stats/top-ips' }),
                apiFetch({ path: '/bill-manager/v1/logs/stats/hourly-activity' }),
            ]);

            setChartsData({
                overTime: overTime.data || [],
                byCategory: byCategory.data || [],
                topUsers: topUsers.data || [],
                topIps: topIps.data || [],
                hourlyActivity: hourlyActivity.data || [],
            });
        } catch (error) {
            console.error('Error fetching charts data:', error);
        } finally {
            setChartsLoading(false);
        }
    };

    useEffect(() => {
        fetchChartsData();
    }, []);

    useImperativeHandle(ref, () => ({
        fetchChartsData,
    }));

    const overTimeSpec = {
        type: 'line',
        // theme: 'semi',
        data: {
            values: chartsData.overTime.map(item => ({ date: item.date, total: item.total }))
        },
        xField: 'date',
        yField: 'total',
        // title: { text: 'Logs Over Time' },
        point: { size: 5 },
        smooth: true,
    };

    const byCategorySpec = {
        type: 'bar',
        // theme: 'semi',
        data: {
            values: chartsData.byCategory.map(item => ({ category: item.category, total: item.total }))
        },
        xField: 'category',
        yField: 'total',
        // title: { text: 'Logs by Category' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    const topUsersSpec = {
        type: 'bar',
        // theme: 'semi',
        data: {
            values: chartsData.topUsers.map(item => ({ user: item.display_name || `User ${item.user_id}`, total: item.total }))
        },
        xField: 'user',
        yField: 'total',
        // title: { text: 'Top 10 Users' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    const categoryPieSpec = {
        type: 'pie',
        // theme: 'semi',
        data: {
            values: chartsData.byCategory.map(item => ({ category: item.category, total: item.total }))
        },
        valueField: 'total',
        categoryField: 'category',
        // title: { text: 'Category Share' },
        label: { visible: true },
        outerRadius: 0.8,
        innerRadius: 0.5,
        pie: {
            state: {
                hover: { stroke: '#000', lineWidth: 1 }
            }
        },
    };

    const topIpsSpec = {
        type: 'bar',
        // theme: 'semi',
        data: {
            values: chartsData.topIps.map(item => ({ ip: item.ip, total: item.total }))
        },
        xField: 'ip',
        yField: 'total',
        // title: { text: 'Top 10 IPs' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    const hourlyActivitySpec = {
        type: 'bar',
        // theme: 'semi',
        data: {
            values: chartsData.hourlyActivity.map(item => ({ hour: `${item.hour}:00`, total: item.total }))
        },
        xField: 'hour',
        yField: 'total',
        // title: { text: 'Hourly Activity' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    return (
        <div className='pb-4'>
            <Row>
                <Col lg={6} className='mt-4'>
                    <Card>
                        <Card.Header>{__('Logs Over Time', 'bill-manager')}</Card.Header>
                        <Card.Body><VChart spec={overTimeSpec} /></Card.Body>                        
                    </Card>
                </Col>
                <Col lg={6} className='mt-4'>
                    <Card>
                        <Card.Header>{__('Logs by Category', 'bill-manager')}</Card.Header>
                        <Card.Body>
                        <VChart spec={byCategorySpec} />
                            </Card.Body>  
                    </Card>
                </Col>
                <Col lg={6} className='mt-4'>
                    <Card>
                        <Card.Header>{__('Top Users', 'bill-manager')}</Card.Header>
                        <Card.Body>
                        <VChart spec={topUsersSpec} />
                            </Card.Body>  
                    </Card>
                </Col>
                <Col lg={6} className='mt-4'>
                    <Card>
                        <Card.Header>{__('Category Share', 'bill-manager')}</Card.Header>
                        <Card.Body>
                        <VChart spec={categoryPieSpec} />
                            </Card.Body>  
                    </Card>
                </Col>
                <Col lg={6} className='mt-4'>
                    <Card>
                        <Card.Header>{__('Top IPs', 'bill-manager')}</Card.Header>
                        <Card.Body>
                        <VChart spec={topIpsSpec} />
                        </Card.Body>  
                    </Card>
                </Col>
                <Col lg={6} className='mt-4'>
                    <Card>
                        <Card.Header>{__('Hourly Activity', 'bill-manager')}</Card.Header>
                        <Card.Body>
                            <VChart spec={hourlyActivitySpec} />
                        </Card.Body>  
                        
                    </Card>
                </Col>
            </Row>
        </div>
    );
});

LogsCharts.displayName = 'LogsCharts';

export default LogsCharts;
