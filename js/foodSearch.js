/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var currentuser={};
$(function () {
    //autocomplete from the food search API

    if (localStorage.currentuser)
    {
        currentuser = JSON.parse(localStorage.currentuser);
        $(".loginInfo").html("<div>Logged in as " + currentuser.username + "</div><div>Logout</div>");
    }
    else
    {
        $(".loginInfo").html("Please login");
    }

});
function initializeAutoComplete()
{
    $("#foodKeyword").autocomplete({
        //source: "https://test.holmusk.com/food/search?q="+$('#foodKeyword').val(),
        source: function (request, response) {
            //since the autocomplete feature will send the GET parameter with a default key => "name"
            //hence, creating a source function which will return the response JSON
            $.get("https://test.holmusk.com/food/search", {q: $('#foodKeyword').val()}, function (data) {
                response(data);
            });
        },
        search: function (event, ui) {
            //to show the spinner while search starts
            $('#foodKeyword').addClass('loadinggif');
        },
        response: function (event, ui) {
            if (ui.content && ui.content.length)
                constructFoodTable(ui.content);
            else
                $("#foodResult").html("<tr><td style='text-align:center;'>No result found</td></tr>");
            //to show the spinner while search ends
            $('#foodKeyword').removeClass('loadinggif');
        },
        open: function (event, ui) {
            //since the results are populated in a custom table, the default autocomplete list should be hidden
            $(".ui-autocomplete").hide();
        }
    });
}


function toggleLogin()
{
    if(localStorage.currentuser)
    {
        delete localStorage.currentuser;
        window.location.replace("login.html");
    }
    else
    {
        window.location.replace("login.html");
    }
}


function validateForm()
{
    return false;
}

function doLogin()
{
    var allUsers;
    if (localStorage.allUsers)
    {
        allUsers = JSON.parse(localStorage.allUsers);
    }
    else
    {
        allUsers = {};
    }
    
    
    if(!validateAlphaNumeric($("#username").val()))
    {
       $("#formError").html("Invalid Username");
       return false;
    }
    else if(!$("#password").val())
    {
        $("#formError").html("Password is mandatory");
        return false;
    }
    else if(!allUsers[$("#username").val()])
    {
        $("#formError").html("Username does not exist");
        return false;
    }
    else if(allUsers[$("#username").val()].password!==$("#password").val())
    {
        $("#formError").html("Password wrong");
        return false;
    }
    else
    {
        localStorage.currentuser = JSON.stringify(allUsers[$("#username").val()]);
        setTimeout(function () {
            window.location.replace("index.html");
        }, 100);
        return false;
    }
}

function signup()
{
    var allUsers;
    if (localStorage.allUsers)
    {
        allUsers = JSON.parse(localStorage.allUsers);
    }
    else
    {
        allUsers = {};
    }
    if(!validateAlphaNumeric($("#username").val()))
    {
       $("#formError").html("Invalid Username");
       return false;
    }
    else if(!$("#password").val() || !$("#confirmPassword").val())
    {
        $("#formError").html("Password is mandatory");
        return false;
    }
    else if($("#password").val()!==$("#confirmPassword").val())
    {
        $("#formError").html("Password does not match");
        return false;
    }
    else if(allUsers[$("#username").val()])
    {
        $("#formError").html("Username already exists");
        return false;
    }
    else
    {
        allUsers[$("#username").val()]={username:$("#username").val(), password:$("#password").val()};
        localStorage.allUsers = JSON.stringify(allUsers);
        localStorage.currentuser = JSON.stringify(allUsers[$("#username").val()]);
        setTimeout(function () {
            window.location.replace("index.html");
        }, 100);
        return false;
    }
    
}



function validateAlphaNumeric(username) {
    if (/[^a-zA-Z0-9\-\/]/.test(username)) {
        return false;
    }
    return true;
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}



function generateDailyRecords(date)
{
    var allUsers;
    if (localStorage.allUsers)
    {
        allUsers = JSON.parse(localStorage.allUsers);
    }
    else
    {
        allUsers = {};
    }
    
    var currentUserData;
    if(allUsers[currentuser.username].data)
    {
        
        var allDates=Object.keys(allUsers[currentuser.username].data);
        allDates.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b) - new Date(a);
        });
        if(!date)
            date=allDates[0];
        
        var index=allDates.indexOf(date);
        
        
        //updating the right arrow to navigate future records from the current date
        if(index>0)
        {
            $("#recordsRight").show();
            $("#recordsRight").attr("onclick", "generateDailyRecords('"+allDates[index-1]+"')");
        }
        else
        {
            $("#recordsRight").hide();
        }
        
        //updating the right arrow to navigate future records from the current date
        if(index!==allDates.length-1)
        {
            $("#recordsLeft").show();
            $("#recordsLeft").attr("onclick", "generateDailyRecords('"+allDates[index+1]+"')");
        }
        else
        {
            $("#recordsLeft").hide();
        }
        
        $("#recordsDate").html(date);
        if(allDates)
        currentUserData=allUsers[currentuser.username].data[date];
        var foodArray=[];
        for(var id in currentUserData)
        {
            foodArray.push(currentUserData[id]);
        }
        constructFoodTable(foodArray);
    }
    else
    {
        constructFoodTable([]);
    }
       
}


constructFoodTable.currentFoods;
function constructFoodTable(currentFoods)
{
    constructFoodTable.currentFoods = currentFoods;
    var html = "";
    for (var i = 0; i < currentFoods.length; i++)
    {
        html += "<tr>";
        html += "   <td style='font-weight:bold;'>" + currentFoods[i].name + "</td>";
        var caloriesPerServing = currentFoods[i].portions[0].nutrients.important.calories;
        html += "   <td>" + caloriesPerServing.value + " " + caloriesPerServing.unit + " / " + currentFoods[i].portions[0].name + "</td>";

        var caloriesPer100g = currentFoods[i].portions[1].nutrients.important.calories;
        html += "   <td>" + caloriesPer100g.value + " " + caloriesPer100g.unit + " / " + currentFoods[i].portions[1].name + "</td>";
        html += "<td><a data-tooltip='View more details about this food'><img src='images/view.png' class='foodIcons' onclick='openFoodDetails(" + i + ")'/></td>";
        html += "<td><a data-tooltip='Add this food to today with default serving'><img src='images/add.png' class='foodIcons' onclick='addThisFood(" + i + ", 0)'/></td>";
        html += "</tr>";
    }
    $("#foodResult").html(html);

}


function addThisFood(index, servingIndex)
{
    if(!localStorage.currentuser)
    {
        window.location.replace("login.html");
        return;
    }
    var allUsers;
    if (localStorage.allUsers)
    {
        allUsers = JSON.parse(localStorage.allUsers);
    }
    else
    {
        allUsers = {};
    }
    
    var currentUserData;
    if(allUsers[currentuser.username].data)
        currentUserData=allUsers[currentuser.username].data;
    else
        currentUserData={};
    
    $("#foodDetailsModal").find(".close-reveal-modal").click();
    var selectedDate = $("#foodLogDate").val();
    var currentFood = constructFoodTable.currentFoods[index];

    if (currentUserData[selectedDate] && (currentUserData[selectedDate][currentFood._id]))
    {// this food already exists on the same day
        var successMsg = "Seems like you have added this food already for the same day.(" + selectedDate + ")";
        $("#warningModal").find(".foodName").html(currentFood.name);
        $("#warningModal").find(".foodMsg").html(successMsg);
        
        //$("#warningModal").find(".yesBtn").attr("onclick", "addThisFood(" + index + "," + servingIndex + ", 1)");
        // opening the success message modal pop up
        $("#warningModalTrigger").click();
    }
    else
    {
        if(!currentUserData[selectedDate])
            currentUserData[selectedDate]={};
        
        //updating the index object
        currentUserData[selectedDate][currentFood._id]=currentFood;
        allUsers[currentuser.username].data=currentUserData;
        localStorage.allUsers=JSON.stringify(allUsers);
        

        
        var successMsg = "Added to your food log on " + selectedDate + " (" + currentFood.portions[servingIndex].name + ")";
        $("#successModal").find(".foodName").html(currentFood.name);
        $("#successModal").find(".foodMsg").html(successMsg);
        $("#successModalTrigger").click();
        
//        for auto closing the success message after 2 sec
//        setTimeout(function () {
//            $("#successModal").find(".close-reveal-modal").click();
//        }, 2000);

    }


}


function openFoodDetails(index)
{
    constructFoodDetailsHtml(index, 0);

    // opening the food details modal pop up
    $("#foodDetailsModalTrigger").click();
}


function constructFoodDetailsHtml(index, servingIndex)
{
    var currentFood = constructFoodTable.currentFoods[index];
    $("#foodName").html(currentFood.name);

    //genrating the important nutrients table
    $("#foodDetailsTableImp").html(generateContent(currentFood.portions[servingIndex].nutrients["important"]));

    //genrating the extra nutrients table
    $("#foodDetailsTableExt").html(generateContent(currentFood.portions[servingIndex].nutrients["extra"]));
    var nextServingIndex;
    if (servingIndex === 0)
        nextServingIndex = 1;
    else if (servingIndex === 1)
        nextServingIndex = 0;
    $("#myonoffswitch").attr("onchange", "constructFoodDetailsHtml(" + index + "," + nextServingIndex + ")");
    $(".addLogButton").attr("onclick", "addThisFood(" + index + "," + servingIndex + ")");

    //this method will genrate the table of nutrients information
    function generateContent(nutrientdInfo)
    {
        var html = "";
        for (var key in nutrientdInfo)
        {
            if (nutrientdInfo[key])
            {
                html += "<tr>";
                html += "<td>" + key + "<td>";
                html += "<td>" + nutrientdInfo[key].value + " " + nutrientdInfo[key].unit + "<td>";
                html += "<tr>";
            }
        }
        return html;
    }

}



function closeModal(modalId)
{
    $("#"+modalId).find(".close-reveal-modal").click();
}