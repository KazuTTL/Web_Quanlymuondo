import { Spin } from 'antd';
import React from 'react';

const PageLoading: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
			}}
		>
			<Spin size="large" />
		</div>
	);
};

export default PageLoading;
