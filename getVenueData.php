<?php
//include 'mysqli.class.php';

//database information
//include 'database_credentials.php';
$data='';
$file = fopen("OpenData/kohteet.xml", "r") or die("Unable to open file!");

while(!feof($file)){

    $data =$data. fgets($file)."\n";
    # do same stuff with the $line
}
fclose($file);   
echo $data;

?>