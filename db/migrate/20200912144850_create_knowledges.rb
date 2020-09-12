class CreateKnowledges < ActiveRecord::Migration[6.0]
  def change
    create_table :knowledges do |t|
      t.string :card_id
      t.decimal :ease_factor
      t.integer :interval_s
      t.integer :learning_step
      t.integer :repetitions

      t.timestamps
    end

    add_index :knowledges, [:card_id], unique: true
  end
end
