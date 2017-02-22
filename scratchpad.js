Plan.find().exec(function(err, plans) {
    
  var date = new Date();
  
  plans.forEach(function(planItem) {
    if (checkIfDue(planItem)) {
      updateRegister();
    };
  });
});

function updateRegister() {
  var fullDate = new Date(date.getFullYear(), date.getMonth(), 1)
  var newRegister =   {date: fullDate,
              merchant: planItem.merchant,
              amount: planItem.amount,
              accountName: planItem.accountName,
              institution: planItem.institution,
              memo: planItem.memo,
              reconciled: {status: "No"}
              }   
  Register.find(newRegister).exec(function(err, foundReg) {
    if (!foundReg.length) {
      Register.create(newRegister, function(err, newReg) {
      if (err) {
        console.log("create error for " + planItem.description)
        } else {
          newReg.reconciled.id = 0,
          newReg.reconciled.status = "No",
          newReg.reconciled.date = "" ,
          newReg.reconciled.merchant = "",
          newReg.reconciled.amount =  0,
          newReg.reconciled.institution = "",
          newReg.reconciled.transaction_type =  "",
          newReg.reconciled.dateTo =  "",
          newReg.save();
        };
      });
    };
  });
}


function checkIfDue(planData) {
  var incrMonth = 1,
      incrYear = 0,
      today = Date();
  // Check to see if plan expired
  if (today <= planData.untilDate ) {
    return false}

  if (planData.frequency === 'Once' || planData.frequency === 'Monthly') {  
    if (planData.date.getMonth+1 === today.getMonth+1 && planData.date.getFullYear === today.getFullYear) { 
        if (planData.date.getMonth+1 === today.getMonth+1 && planData.date.getFullYear === today.getFullYear) {
          return true;
        } else if (planData.date.getMonth+1 < today.getMonth+1 && planData.date.getFullYear > today.getFullYear) {
          return true;
        } else
        return false;
      }
    };

  if (planData.frequency === 'Quarterly' ) {  
    var chkForQtr =monthDiff(planData.date, today) % 3
    if (chkForQtr === 0) {
      return true;
    };
  };
};

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}