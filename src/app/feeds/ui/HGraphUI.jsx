'use client'
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const HGraphUI = ({ value }) => {
    // Transform the object data into an array of { time, value }
    const data = React.useMemo(() => {
        if (!value || typeof value !== 'object') return [];
        
        return Object.entries(value)
            .filter(([key]) => {
                const val = value[key];
                return key !== 'isSelected' && 
                       typeof val === 'object' && 
                       val !== null && 
                       val.time !== undefined && 
                       val.value !== undefined;
            })
            .map(([_, val]) => ({
                time: val.time,
                value: val.value,
            }))
            .sort((a, b) => a.time - b.time);
    }, [value]);

    if (data.length === 0) {
        return <div className="text-muted text-center p-4">No data available</div>;
    }

    // Format time for XAxis
    const formatTime = (time) => {
        const date = new Date(time);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ width: '100%', height: 180, position: 'relative', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00fff2" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#00fff2" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
                    <XAxis 
                        dataKey="time" 
                        tickFormatter={formatTime} 
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#527daf', fontSize: 10 }}
                        minTickGap={30}
                    />
                    <YAxis 
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#527daf', fontSize: 10 }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(26, 26, 26, 0.9)', 
                            border: '1px solid #00fff2', 
                            borderRadius: '8px',
                            color: '#fff', 
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#00fff2' }}
                        labelStyle={{ color: '#888', marginBottom: '4px' }}
                        labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        cursor={{ stroke: '#00fff2', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00fff2" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={1500}
                        activeDot={{ r: 6, fill: '#00fff2', stroke: '#2e3237', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HGraphUI;
