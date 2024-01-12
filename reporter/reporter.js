// @ts-nocheck
'use strict';

const mustache = require( 'mustache' );

const report = module.exports = {};

// Compile template and output formatted results
report.results = async ( dataArray, reportTemplate ) => {
    // Group items by name
    const groupedData = groupDataByName( dataArray );

    // Render the template
    return mustache.render( reportTemplate, {
        // The current date
        date: new Date(),

        // Results
        groupedData,

        // Total Count
        totalCount: dataArray.length,
    } );
};

// Output error messages
report.error = ( message ) => {
    return message;
};

// Helper function to group data by name
function groupDataByName( dataArray ) {
    const groupedData = {};

    dataArray.forEach( ( item ) => {
        if ( !groupedData[item.name] ) {
            groupedData[item.name] = [];
        }

        groupedData[item.name].push( {
            selector: item.selector,
            context: item.context,
        } );
    } );

    return Object.entries( groupedData ).map( ( [name, items] ) => ( {
        name,
        items,
    } ) );
}
