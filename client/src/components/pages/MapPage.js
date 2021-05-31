import React from 'react';
import MapComponent from './MapComponent';

class MapPage extends React.Component{
	render() {
		console.log('map page');
    	return (
      		<div id='map'>
        		<MapComponent/>
      		</div>
    	);
  	}
}

export default MapPage;