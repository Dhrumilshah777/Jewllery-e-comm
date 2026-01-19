const PromoBanner = require('../models/PromoBanner');

// Get promo banner data
exports.getPromoBanner = async (req, res) => {
  try {
    let promoBanner = await PromoBanner.findOne();
    if (!promoBanner) {
      // Return default data if not exists
      return res.status(200).json({
        panel1Image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
        panel1Title: 'New Collection & Jewelry Charm Rings',
        panel1Link: '/products?category=Rings',
        
        panel2Image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1600&auto=format&fit=crop',
        panel2Title: 'Flat Discount & Necklaces Body Jewels',
        panel2Link: '/products?category=Necklaces',

        panel3Image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
        panel3Title: 'Fashion 2021 Just Lunched Desk The Hals',
        panel3Link: '/products?category=Bracelets',
      });
    }
    res.status(200).json(promoBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching promo banner data', error: error.message });
  }
};

// Update promo banner data
exports.updatePromoBanner = async (req, res) => {
  try {
    const { 
      panel1Image, panel1Title, panel1Link,
      panel2Image, panel2Title, panel2Link,
      panel3Image, panel3Title, panel3Link
    } = req.body;

    let promoBanner = await PromoBanner.findOne();
    if (promoBanner) {
      promoBanner.panel1Image = panel1Image;
      promoBanner.panel1Title = panel1Title;
      promoBanner.panel1Link = panel1Link;
      
      promoBanner.panel2Image = panel2Image;
      promoBanner.panel2Title = panel2Title;
      promoBanner.panel2Link = panel2Link;

      promoBanner.panel3Image = panel3Image;
      promoBanner.panel3Title = panel3Title;
      promoBanner.panel3Link = panel3Link;
      
      await promoBanner.save();
    } else {
      promoBanner = await PromoBanner.create({
        panel1Image, panel1Title, panel1Link,
        panel2Image, panel2Title, panel2Link,
        panel3Image, panel3Title, panel3Link
      });
    }
    res.status(200).json(promoBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating promo banner data', error: error.message });
  }
};
