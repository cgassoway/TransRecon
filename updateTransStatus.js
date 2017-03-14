db.transactions.update({'reconciled.status':'Yes'}, {$set: {'reconciled.status': 'No'}}, {multi:true});
