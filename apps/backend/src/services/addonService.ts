import { AddOn, type IAddOn } from '../models/AddOn.js';
import { ProductAddOn } from '../models/ProductAddOn.js';
import { NotFoundError } from '../utils/AppError.js';

export const createAddOn = async (
  addOnData: Partial<IAddOn>
): Promise<IAddOn> => {
  const addOn = await AddOn.create(addOnData);
  return addOn;
};

export const getAllAddOns = async (): Promise<IAddOn[]> => {
  const addOns = await AddOn.find({
    deletedAt: null,
  }).sort({ category: 1, name: 1 });
  return addOns;
};

export const getAddOnById = async (id: string): Promise<IAddOn> => {
  const addOn = await AddOn.findOne({ _id: id, deletedAt: null });
  if (!addOn) {
    throw new NotFoundError('Add-on not found');
  }
  return addOn;
};

export const updateAddOn = async (
  id: string,
  updateData: Partial<IAddOn>
): Promise<IAddOn> => {
  const addOn = await AddOn.findOneAndUpdate(
    { _id: id, deletedAt: null },
    updateData,
    { new: true, runValidators: true }
  );

  if (!addOn) {
    throw new NotFoundError('Add-on not found');
  }

  return addOn;
};

export const deleteAddOn = async (id: string): Promise<void> => {
  const addOn = await AddOn.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!addOn) {
    throw new NotFoundError('Add-on not found');
  }
};

export const getAddOnsByProductId = async (
  productId: string
): Promise<unknown[]> => {
  const productAddOns = await ProductAddOn.find({ productId })
    .populate('addOnId')
    .lean();

  return productAddOns
    .map((pa) => {
      const addOn = pa.addOnId as unknown as IAddOn;
      if (!addOn) return null;

      return {
        id: addOn._id?.toString(),
        name: addOn.name,
        description: addOn.description,
        price: addOn.price,
        category: addOn.category,
        imageUrl: addOn.imageUrl,
        isAvailable: addOn.isAvailable,
        isDefault: pa.isDefault,
      };
    })
    .filter((item) => item !== null && item.isAvailable);
};
