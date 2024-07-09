document.addEventListener( "DOMContentLoaded", function () {
    var collapsibleH2s = document.querySelectorAll( "h2.collapsible" );
    collapsibleH2s.forEach( function ( h2 ) {
        var table = h2.nextElementSibling; // Assuming table follows h2

        // Initially hide the table
        table.style.display = "none";

        // Toggle visibility of table when h2 is clicked
        h2.addEventListener( "click", function ( ev ) {
            if ( ev.target.nodeName === 'A' ) {
                return;
            }
            if ( table.style.display === "none" ) {
                table.style.display = "table";
            } else {
                table.style.display = "none";
            }
        } );
    } );

    document.getElementById( 'expandAll' ).addEventListener( 'click', () => {
        Array.from( document.querySelectorAll( '.collapsible' ) ).forEach( ( a ) => a.click() );
    } );
} );
