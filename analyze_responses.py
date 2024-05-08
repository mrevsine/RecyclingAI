# Data analysis for results from Recyclability study

from collections import Counter
import json
import matplotlib.pyplot as plt
import scipy

###============================================================================
# Functions

# Responses is a 1D or 2D array of T/F values
# If 2D, it will be flattened
def pie_chart(responses, title, save_name):
    # Flatten 2D list, if applicable
    if isinstance(responses[0], list):
        responses = [b for arr in responses for b in arr]
    # Sum Trues and Falses
    y = [sum(responses), len(responses) - sum(responses)]
    labels = ["True", "False"]
    colors = ["#026928", "#dedede"]
    plt.figure(dpi=300)
    plt.pie(y, labels=labels, colors=colors, startangle=90, autopct='%1.1f%%')
    plt.title(title)
    plt.savefig(save_name)

def item_bar_chart(data, labels, bar_labels, bar_colors, label_colors, ylabel, title, save_name, ylim=(0,100), data2=None):

    # Optionally adjust data such that 0-height bars have some height
    eps = 0 # height of zero bars, for adjusting appearance. Set to 0 for now; no change
    data = [v if v != 0 else eps for v in data]

    plt.bar(labels, data, color=bar_colors, label=bar_labels)

    # Format plot
    plt.xticks(rotation=30, ha='right')
    for xtick, color in zip(ax.get_xticklabels(), label_colors):
        xtick.set_color(color)
    plt.ylabel(ylabel)
    if ylim:
        plt.ylim(ylim)
    plt.title(title)
    plt.legend(["Recyclable", "Not recyclable"])
    plt.tight_layout()
    plt.savefig(save_name)

# Return array in specified order
# e.g. arr = [A,B,C,D,E] and order = [3,4,2,0,1] returns [D,E,C,A,B]
def order(arr, order):
    return [arr[i] for i in order]

###============================================================================
# Read in responses and labels

response_file = "results/responses.txt"
with open(response_file, "r") as f:
    responses = json.load(f)

print("Recorded %d responses" % len(responses))
    
label_file = "data/item_labels.txt"
with open(label_file, "r") as f:
    label_lines = f.readlines()
metadata = [line.rstrip().split("\t") for line in label_lines]
metadata_dict = {}
for i,field in enumerate(metadata[0]):
    metadata_dict[field] = [arr[i] for arr in metadata[1:]]
metadata_dict["recyclability"] = [s == "T" for s in metadata_dict["recyclability"]]
metadata_dict["AI_recyclability"] = [s == "T" for s in metadata_dict["AI_recyclability"]]
print(metadata_dict)

###============================================================================
# QC on responses

# Check that all responses are unique
all_distinct = True
for i in range(1, len(responses)):
    for j in range(i):
        agree = True
        for a,b in zip(responses[i], responses[j]):
            if a != b:
                agree = False
                break
        if agree:
            print("Responses %d and %d are identical" % (i,j))
            all_distinct = False
if all_distinct:
    print("All responses are distinct")

# Check that all responses are the same length
response_lengths = [len(response) for response in responses]
all_response_lengths_equal = all(x == response_lengths[0] for x in response_lengths)
print("All responses are length %d: %s" % (len(responses[0]), all_response_lengths_equal))
if not all_response_lengths_equal:
    print("ERROR: not all responses have the same number of questions")
    exit()
 
# Check that each question has the same fields
response_fields = [set(q.keys()) for response in responses for q in response]
all_response_fields_equal = all(x == response_fields[0] for x in response_fields)
print("All questions have the same %d fields: %s" % (len(list(response_fields[0])), all_response_fields_equal)) 
if not all_response_fields_equal:
    print("ERROR: not all responses have the same fields")
    exit()
else:
    print("All questions have these fields:")
    print(list(response_fields[0]))

# Get distribution of each field
for field in list(response_fields[0]):
    field_vals = [q[field] for response in responses for q in response]
    field_cts = Counter(field_vals)
    print("Distribution of %s values:" % field)
    print(field_cts)

###============================================================================
# Format responses by participant and by item

raw_responses = [[q["text"] for q in response] for response in responses]
first_responses = [[r == "Yes" for r in responses[::2]] for responses in raw_responses]
second_responses = [[r == "Yes" for r in responses[1::2]] for responses in raw_responses]

first_item_responses = [[arr[i] for arr in first_responses] for i in range(len(first_responses[0]))]
second_item_responses = [[arr[i] for arr in second_responses] for i in range(len(second_responses[0]))]

###============================================================================
# Print responses in human-readable format for each participant

for i, (first_arr, second_arr) in enumerate(zip(first_responses, second_responses)):
    print("Participant %d:" % (i+1))
    for a,b,label in zip(first_arr, second_arr, metadata_dict["label"]):
        print("    %s - %s, %s" % (label, a, b))

###============================================================================
# Plot pie charts of various labels/responses

pie_chart(metadata_dict["recyclability"], "True recyclability label proportions", "figs/true_label_pie.png")
pie_chart(metadata_dict["AI_recyclability"], "AI recyclability label proportions", "figs/AI_label_pie.png")
pie_chart(first_responses, "Human recyclability response proportions", "figs/human_response_pie.png")
pie_chart(second_responses, "Human+AI recyclability response proportions", "figs/human_AI_response_pie.png")

###============================================================================
# Plot bar charts of accuracy or AI similarity for each item

first_accuracies = [100*sum([resp == ans for resp in round])/len(round) for round,ans in zip(first_item_responses, metadata_dict["recyclability"])]
second_accuracies = [100*sum([resp == ans for resp in round])/len(round) for round,ans in zip(second_item_responses, metadata_dict["recyclability"])]
accuracy_changes = [second - first for first, second in zip(first_accuracies, second_accuracies)]
first_AI_similarities = [100*sum([resp == ans for resp in round])/len(round) for round,ans in zip(first_item_responses, metadata_dict["AI_recyclability"])]
second_AI_similarities = [100*sum([resp == ans for resp in round])/len(round) for round,ans in zip(second_item_responses, metadata_dict["AI_recyclability"])]
AI_similarity_changes = [second - first for first, second in zip(first_AI_similarities, second_AI_similarities)]

ai_correctnesses = [true == ai for true,ai in zip(metadata_dict["recyclability"], metadata_dict["AI_recyclability"])]
bar_labels = ["Recyclable" if recyc else "Not recyclable" for recyc in metadata_dict["recyclability"]]
bar_colors = ["#026928" if recyc else "#dedede" for recyc in metadata_dict["recyclability"]]
label_colors = ["blue" if ai_correct else "red" for ai_correct in ai_correctnesses]

print(AI_similarity_changes)
print(ai_correctnesses)

correct_AI_sim_changes = [c for c,b in zip(AI_similarity_changes, ai_correctnesses) if b]
incorrect_AI_sim_changes = [c for c,b in zip(AI_similarity_changes, ai_correctnesses) if not b]
print(sum(correct_AI_sim_changes)/len(correct_AI_sim_changes))
print(sum(incorrect_AI_sim_changes)/len(incorrect_AI_sim_changes))

simil_change_p = scipy.stats.ttest_ind(correct_AI_sim_changes, incorrect_AI_sim_changes, alternative="greater")
plt.figure(dpi=300, figsize=(5,5))
ax = plt.subplot(111)
ax.boxplot([correct_AI_sim_changes, incorrect_AI_sim_changes], labels=["correct", "incorrect"], widths=0.6)
max_y = max(correct_AI_sim_changes + incorrect_AI_sim_changes) + 2
h=2
ax.plot([1, 1, 2, 2], [max_y, max_y+h, max_y+h, max_y], lw=1.5, c="black")
p_str = "p = " + "{:.3f}".format(simil_change_p.pvalue)
ax.text(1.5, max_y+h, p_str, ha='center', va='bottom', color="black")
ax.set_ylabel("change in similarity to AI label %")
ax.set_title("Change in response similarity to AI among correct and incorrect recommendations")
plt.savefig("figs/AI_similarity_changes_boxplot.png")

first_accuracy_order = [tpl[0] for tpl in sorted([(i,e) for i,e in enumerate(first_accuracies)], key = lambda x: x[1], reverse=True)]
accuracy_change_order = [tpl[0] for tpl in sorted([(i,e) for i,e in enumerate(accuracy_changes)], key = lambda x: x[1], reverse=True)]
first_AI_similarity_order = [tpl[0] for tpl in sorted([(i,e) for i,e in enumerate(first_AI_similarities)], key = lambda x: x[1], reverse=True)]
AI_similarity_change_order = [tpl[0] for tpl in sorted([(i,e) for i,e in enumerate(AI_similarity_changes)], key = lambda x: x[1], reverse=True)]

# First guess accuracy per item
item_bar_chart(data=order(first_accuracies, first_accuracy_order),
                labels=order(metadata_dict["label"], first_accuracy_order), 
                bar_labels=order(bar_labels, first_accuracy_order),
                bar_colors=order(bar_colors, first_accuracy_order), 
                label_colors=order(label_colors, first_accuracy_order), 
                ylabel="accuracy %",
                title="Accuracy of human prediction for each item", 
                save_name="figs/item_human_accuracy_bar.png")

# Second guess accuracy per item
item_bar_chart(data=order(second_accuracies, first_accuracy_order),
                labels=order(metadata_dict["label"], first_accuracy_order), 
                bar_labels=order(bar_labels, first_accuracy_order),
                bar_colors=order(bar_colors, first_accuracy_order), 
                label_colors=order(label_colors, first_accuracy_order), 
                ylabel="accuracy %",
                title="Accuracy of human+AI prediction for each item", 
                save_name="figs/item_human+AI_accuracy_bar.png")

# Change in accuracy per item, ordered by change in accuracy
item_bar_chart(data=order(accuracy_changes, accuracy_change_order),
                labels=order(metadata_dict["label"], accuracy_change_order), 
                bar_labels=order(bar_labels, accuracy_change_order),
                bar_colors=order(bar_colors, accuracy_change_order), 
                label_colors=order(label_colors, accuracy_change_order), 
                ylabel="change in accuracy %",
                title="Change in prediction accuracy for each item", 
                save_name="figs/accuracy_change_bar.png",
                ylim=None)

# Change in accuracy per item, ordered by first guess accuracy
item_bar_chart(data=order(accuracy_changes, first_accuracy_order),
                labels=order(metadata_dict["label"], first_accuracy_order), 
                bar_labels=order(bar_labels, first_accuracy_order),
                bar_colors=order(bar_colors, first_accuracy_order), 
                label_colors=order(label_colors, first_accuracy_order), 
                ylabel="change in accuracy %",
                title="Change in prediction accuracy for each item", 
                save_name="figs/accuracy_change_first_guess_order_bar.png",
                ylim=None)

# First guess AI similarity per item
item_bar_chart(data=order(first_AI_similarities, first_AI_similarity_order),
                labels=order(metadata_dict["label"], first_AI_similarity_order), 
                bar_labels=order(bar_labels, first_AI_similarity_order),
                bar_colors=order(bar_colors, first_AI_similarity_order), 
                label_colors=order(label_colors, first_AI_similarity_order), 
                ylabel="similarity to AI prediction %",
                title="Similarity between human and AI predictions for each item", 
                save_name="figs/item_human_AI_similarity_bar.png")

# Second guess AI similarity per item
item_bar_chart(data=order(second_AI_similarities, first_AI_similarity_order),
                labels=order(metadata_dict["label"], first_AI_similarity_order), 
                bar_labels=order(bar_labels, first_AI_similarity_order),
                bar_colors=order(bar_colors, first_AI_similarity_order), 
                label_colors=order(label_colors, first_AI_similarity_order), 
                ylabel="similarity to AI prediction %",
                title="Similarity between human+AI and AI predictions for each item", 
                save_name="figs/item_human+AI_AI_similarity_bar.png")

# Change in AI similarity per item, ordered by change in AI similarity
item_bar_chart(data=order(AI_similarity_changes, AI_similarity_change_order),
                labels=order(metadata_dict["label"], AI_similarity_change_order), 
                bar_labels=order(bar_labels, AI_similarity_change_order),
                bar_colors=order(bar_colors, AI_similarity_change_order), 
                label_colors=order(label_colors, AI_similarity_change_order), 
                ylabel="change in similarity to AI prediction %",
                title="Change in AI similarity for each item", 
                save_name="figs/AI_similarity_change_bar.png",
                ylim=None)

# Change in AI similarity per item, ordered by first guess AI similarity
item_bar_chart(data=order(AI_similarity_changes, first_AI_similarity_order),
                labels=order(metadata_dict["label"], first_AI_similarity_order),
                bar_labels=order(bar_labels, first_AI_similarity_order), 
                bar_colors=order(bar_colors, first_AI_similarity_order), 
                label_colors=order(label_colors, first_AI_similarity_order), 
                ylabel="change in similarity to AI prediction %",
                title="Change in AI similarity for each item", 
                save_name="figs/AI_similarity_change_first_guess_order_bar.png",
                ylim=None)

###============================================================================
# Plot bar charts of accuracy to true label and similarity to AI label

# Accuracy to true label
first_response_accuracies = [100*sum([guess == label for guess, label in zip(responses, metadata_dict["recyclability"])])/len(first_responses[0]) for responses in first_responses]
second_response_accuracies = [100*sum([guess == label for guess, label in zip(responses, metadata_dict["recyclability"])])/len(second_responses[0]) for responses in second_responses]
avg_first_response_acc = sum(first_response_accuracies) / len(first_response_accuracies)
avg_second_response_acc = sum(second_response_accuracies) / len(second_response_accuracies)
print(avg_first_response_acc)
print(avg_second_response_acc)
plt.figure(dpi=300, figsize=(5,8))
plt.bar(["human", "human+AI"], [avg_first_response_acc, avg_second_response_acc])
plt.ylabel("accuracy %")
plt.ylim(0,100)
plt.title("Response accuracy to true label")
plt.savefig("figs/human_accuracy_bar.png")

# Similarity to AI label
first_response_AI_simils = [100*sum([guess == label for guess, label in zip(responses, metadata_dict["AI_recyclability"])])/len(first_responses[0]) for responses in first_responses]
second_response_AI_simils = [100*sum([guess == label for guess, label in zip(responses, metadata_dict["AI_recyclability"])])/len(second_responses[0]) for responses in second_responses]
avg_first_response_AI_simil = sum(first_response_AI_simils) / len(first_response_AI_simils)
avg_second_response_AI_simil = sum(second_response_AI_simils) / len(second_response_AI_simils)
print(avg_first_response_AI_simil)
print(avg_second_response_AI_simil)
plt.figure(dpi=300, figsize=(5,8))
plt.bar(["human", "human+AI"], [avg_first_response_AI_simil, avg_second_response_AI_simil])
plt.ylabel("similarity to AI label %")
plt.ylim(0,100)
plt.title("Response similarity to AI label")
plt.savefig("figs/human_AI_similarity_bar.png")

###============================================================================
# Statistical test bar plot of true accuracy and AI similarity between human and human+AI

accuracy_p = scipy.stats.ttest_rel(first_response_accuracies, second_response_accuracies)
plt.figure(dpi=300, figsize=(5,5))
ax = plt.subplot(111)
ax.boxplot([first_response_accuracies, second_response_accuracies], labels=["human", "human+AI"], widths=0.6)
max_y = max(first_response_accuracies + second_response_accuracies) + 2
h=2
ax.plot([1, 1, 2, 2], [max_y, max_y+h, max_y+h, max_y], lw=1.5, c="black")
p_str = "p = " + "{:.3f}".format(accuracy_p.pvalue)
ax.text(1.5, max_y+h, p_str, ha='center', va='bottom', color="black")
ax.set_ylim(0,100)
ax.set_ylabel("accuracy %")
ax.set_title("Accuracy of responses to true label")
plt.savefig("figs/accuracy_boxplot.png")

AI_simil_p = scipy.stats.ttest_rel(first_response_AI_simils, second_response_AI_simils)
plt.figure(dpi=300, figsize=(5,5))
ax = plt.subplot(111)
ax.boxplot([first_response_AI_simils, second_response_AI_simils], labels=["human", "human+AI"], widths=0.6)
max_y = max(first_response_AI_simils + second_response_AI_simils) + 2
h=2
ax.plot([1, 1, 2, 2], [max_y, max_y+h, max_y+h, max_y], lw=1.5, c="black")
p_str = "p = " + "{:.3f}".format(AI_simil_p.pvalue)
ax.text(1.5, max_y+h, p_str, ha='center', va='bottom', color="black")
ax.set_ylim(0,120)
ax.set_ylabel("similarity to AI label %")
ax.set_title("Similarity of responses to AI")
plt.savefig("figs/AI_similarity_boxplot.png")

