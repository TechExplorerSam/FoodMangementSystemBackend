const chefs=require('../Models/Chefs')
const FoodItem=require('../Models/FoodItems')
exports.freeingAChef = async () => {
  try {
    const chefsdata = await chefs.find();
    if (!chefsdata || chefsdata.length === 0) {
      throw new Error('No chefs found');
    }

    for (let i = 0; i < chefsdata.length; i++) {
      const chef = chefsdata[i];

      if (chef.chefStatus === 'Busy' && chef.chefCurrentOrder.length > 0) {
        const now = new Date();
        const elapsedMinutes = Math.floor((now - chef.chefCookingTime) / 60000);

        const foodItems = await FoodItem.find({
          _id: { $in: chef.chefCurrentOrder.map(item => item.itemId) }
        });

        if (!foodItems.length) continue;

        const totalCookingTime = foodItems.reduce((total, item) => total + (item.FoodItemCookingTime || 0), 0);

        if (elapsedMinutes >= totalCookingTime) {
          chef.chefCurrentOrderStatus = 'Served';
          chef.chefCurrentOrder = [];
          chef.chefCookingTime = 0;
          chef.chefStatus = 'Free';

          await chef.save();
        } else {
          chef.chefCurrentOrderStatus = 'Processing';
          await chef.save(); 
        }
      }
    }

    return chefsdata;
  } catch (err) {
    console.error('Error in freeingAChef:', err);
    throw new Error('Error while freeing chefs');
  }
};


exports.assignChefToOrder = async (orderItems) => {
  try {
    const allChefs = await chefs.find();

    if (!allChefs || allChefs.length === 0) {
      throw new Error("No chefs available");
    }

    const freeChef = allChefs.find(chef => 
      chef.chefStatus === 'Free' && 
      (!chef.chefCurrentOrder || chef.chefCurrentOrder.length === 0)
    );

    if (freeChef) {
      freeChef.chefCurrentOrder = orderItems;
      freeChef.chefCookingTime = new Date();
      freeChef.chefCurrentOrderStatus = 'Processing';
      freeChef.chefStatus = 'Busy';
      await freeChef.save();
      return freeChef;
    }

   const chefWithTime = await Promise.all(allChefs.map(async (chef) => {
  const now = new Date();
  const elapsed = Math.floor((now - chef.chefCookingTime) / 60000);

  const foodItems = await FoodItem.find({
    _id: { $in: chef.chefCurrentOrder?.map(item => item.itemId) }
  });

  const totalCookTime = foodItems.reduce((sum, f) => sum + (f.FoodItemCookingTime || 0), 0);
  const remainingTime = Math.max(totalCookTime - elapsed, 0);

  return { chef, remainingTime };
}));


    chefWithTime.sort((a, b) => a.remainingTime - b.remainingTime);

    const selectedChef = chefWithTime[0].chef;
    selectedChef.chefCurrentOrder = orderItems;
    
    selectedChef.chefCookingTime = new Date();
    selectedChef.chefCurrentOrderStatus = 'Processing';
    selectedChef.chefStatus = 'Busy';
    await selectedChef.save();

    return selectedChef;
  } catch (err) {
    console.error("Chef assignment failed:", err);
    throw new Error("Could not assign chef");
  }
};


